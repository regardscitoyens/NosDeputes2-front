import { sql } from 'kysely'
import { GetServerSideProps } from 'next'
import {
  addLatestGroupToDeputes,
  latestGroupIsNotNull,
} from '../../lib/addLatestGroup'
import { buildGroupesData } from '../../lib/buildGroupesData'
import { dbLegacy } from '../../lib/dbLegacy'
import { dbReleve } from '../../lib/dbReleve'
import { CURRENT_LEGISLATURE, sortGroupes } from '../../lib/hardcodedData'
import * as PageTypes from './DeputeList.types'

export const getServerSideProps: GetServerSideProps<{
  data: PageTypes.Props
}> = async context => {
  // TODO vérifier s'il y a pas des doubles, est-ce qu'un député peut avoir deux mandats s'il part/revient ?
  // TODO pourquoi j'ai 600 deputes, vs 599 sur l'ancienne page ?
  const newdeputes: PageTypes.DeputeSimple[] = (
    await dbReleve
      .selectFrom('acteurs')
      .innerJoin('mandats', 'acteurs.uid', 'mandats.acteur_uid')
      .innerJoin('organes', join =>
        join.on('organes.uid', '=', sql`ANY(mandats.organes_uids)`),
      )
      // left join to be tolerant if the mapping to NosDeputes misses some data
      .leftJoin('nosdeputes_deputes', 'nosdeputes_deputes.uid', 'acteurs.uid')
      .where(sql`organes.data->>'codeType'`, '=', 'ASSEMBLEE')
      .where(
        sql`organes.data->>'legislature'`,
        '=',
        CURRENT_LEGISLATURE.toString(),
      )
      .select('acteurs.uid')
      .select('nosdeputes_deputes.slug')
      .select(
        sql<string>`acteurs.data->'etatCivil'->'ident'->>'prenom'`.as(
          'firstName',
        ),
      )
      .select(
        sql<string>`acteurs.data->'etatCivil'->'ident'->>'nom'`.as('lastName'),
      )
      .select(
        sql<string>`mandats.data->'election'->'lieu'->>'departement'`.as(
          'circoDepartement',
        ),
      )
      .select(
        sql<boolean>`mandats.data->>'dateFin' IS NULL`.as('mandatOngoing'),
      )
      .orderBy('lastName')
      .execute()
  ).map(depute => {
    const { firstName, lastName, ...rest } = depute
    return {
      fullName: `${firstName} ${lastName}`,
      firstLetterLastName: lastName[0] ?? 'z',
      ...rest,
    }
  })

  const deputes = (
    await dbLegacy
      .selectFrom('parlementaire')
      .select([
        'id',
        'slug',
        'nom',
        'nom_de_famille',
        'nom_circo',
        'fin_mandat',
      ])
      .execute()
  ).map(row => {
    const { fin_mandat, ...rest } = row
    return {
      ...rest,
      mandatOngoing: fin_mandat === null,
    }
  })
  const deputesWithGroup = await addLatestGroupToDeputes(deputes)
  const groupesData = sortGroupes(
    buildGroupesData(
      deputesWithGroup
        .filter(_ => _.mandatOngoing)
        .filter(latestGroupIsNotNull),
    ),
  )
  return {
    props: {
      data: {
        deputes: newdeputes.map(depute => ({
          ...depute,
          latestGroup: null,
        })),
        groupesData: [],
      },
    },
  }
}
