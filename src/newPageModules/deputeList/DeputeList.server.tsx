import { sql } from 'kysely'
import { GetServerSideProps } from 'next'
import {
  addLatestGroupToDeputes,
  latestGroupIsNotNull,
} from '../../lib/newAddLatestGroup'
import { buildGroupesData } from '../../lib/buildGroupesData'
import { dbLegacy } from '../../lib/dbLegacy'
import { dbReleve } from '../../lib/dbReleve'
import { CURRENT_LEGISLATURE, sortGroupes } from '../../lib/hardcodedData'
import * as PageTypes from './DeputeList.types'
import sortBy from 'lodash/sortBy'

export const getServerSideProps: GetServerSideProps<{
  data: PageTypes.Props
}> = async context => {
  const rows = await dbReleve
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
    .select(sql<boolean>`mandats.data->>'dateFin' IS NULL`.as('mandatOngoing'))
    // a depute can have several mandats in the same legislature
    .distinctOn('acteur_uid')
    .execute()

  const newdeputes: PageTypes.DeputeSimple[] = sortBy(
    rows,
    // this sort can't be done in the SQL
    // incompatible with our DISTINCT clause
    _ => _.lastName,
  ).map(depute => {
    const { firstName, lastName, ...rest } = depute
    return {
      fullName: `${firstName} ${lastName}`,
      firstLetterLastName: lastName[0] ?? 'z',
      ...rest,
    }
  })

  const deputeslegacy = (
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
  const newDeputesWithGroup = await addLatestGroupToDeputes(newdeputes)
  // const groupesData = sortGroupes(
  //   buildGroupesData(
  //     newDeputesWithGroup
  //       .filter(_ => _.mandatOngoing)
  //       .filter(latestGroupIsNotNull),
  //   ),
  // )
  return {
    props: {
      data: {
        deputes: newDeputesWithGroup,
        groupesData: [],
      },
    },
  }
}
