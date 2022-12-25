import { sql } from 'kysely'
import sortBy from 'lodash/sortBy'
import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import {
  FIRST_LEGISLATURE,
  LATEST_LEGISLATURE,
  sortGroupes,
} from '../../lib/hardcodedData'
import {
  addLatestGroupToDeputes,
  latestGroupIsNotNull,
} from '../../lib/newAddLatestGroup'
import { buildGroupesData } from '../../lib/buildGroupesData'
import * as PageTypes from './DeputeList.types'
import range from 'lodash/range'

// two ways to access this page :
// /deputes
// /deputes/15
type Query = {
  legislature?: string
}

export const getServerSideProps: GetServerSideProps<{
  data: PageTypes.Props
}> = async context => {
  const query = context.query as Query
  const legislatureInPath = query.legislature
    ? parseInt(query.legislature, 10)
    : null
  if (legislatureInPath === LATEST_LEGISLATURE) {
    return {
      redirect: {
        permanent: false,
        destination: `/deputes`,
      },
    }
  }
  const legislature = legislatureInPath ?? LATEST_LEGISLATURE
  const legislatureNavigationUrls = range(
    FIRST_LEGISLATURE,
    LATEST_LEGISLATURE + 1,
  ).map(l => {
    const tuple: [number, string] = [
      l,
      `/deputes${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`,
    ]
    return tuple
  })

  const rows = await dbReleve
    .selectFrom('acteurs')
    .innerJoin('mandats', 'acteurs.uid', 'mandats.acteur_uid')
    .innerJoin('organes', join =>
      join.on('organes.uid', '=', sql`ANY(mandats.organes_uids)`),
    )
    // left join to be tolerant if the mapping to NosDeputes misses some data
    .leftJoin('nosdeputes_deputes', 'nosdeputes_deputes.uid', 'acteurs.uid')
    .where(sql`organes.data->>'codeType'`, '=', 'ASSEMBLEE')
    .where(sql`organes.data->>'legislature'`, '=', legislature.toString())
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

  const newDeputesWithGroup = await addLatestGroupToDeputes(
    newdeputes,
    legislature,
  )
  const groupesData = sortGroupes(
    buildGroupesData(
      newDeputesWithGroup
        .filter(_ => _.mandatOngoing)
        .filter(latestGroupIsNotNull),
    ),
  )
  return {
    props: {
      data: {
        legislature,
        legislatureNavigationUrls,
        deputes: newDeputesWithGroup,
        groupesData,
      },
    },
  }
}
