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
  const newdeputes = await dbReleve
    .selectFrom('acteurs')
    .innerJoin('mandats', 'acteurs.uid', 'mandats.acteur_uid')
    .innerJoin('organes', join =>
      join.on('organes.uid', '=', sql`ANY(mandats.organes_uids)`),
    )
    .leftJoin('nosdeputes_deputes', 'nosdeputes_deputes.uid', 'acteurs.uid')
    .where(sql`organes.data->>'codeType'`, '=', 'ASSEMBLEE')
    .where(
      sql`organes.data->>'legislature'`,
      '=',
      CURRENT_LEGISLATURE.toString(),
    )
    .select('acteurs.uid')
    .execute()

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
        deputes: deputesWithGroup,
        groupesData,
      },
    },
  }
}
