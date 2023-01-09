import { sql } from 'kysely'
import sortBy from 'lodash/sortBy'
import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import {
  FIRST_LEGISLATURE_FOR_DEPUTES,
  LATEST_LEGISLATURE,
  sortGroupes,
} from '../../lib/hardcodedData'
import {
  addLatestGroupToDeputes,
  latestGroupIsNotNull,
} from '../../lib/newAddLatestGroup'
import { buildGroupesData } from '../../lib/buildGroupesData'
import * as types from './DeputeList.types'
import range from 'lodash/range'

// two ways to access this page :
// /deputes
// /deputes/15
type Query = {
  legislature?: string
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
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
    FIRST_LEGISLATURE_FOR_DEPUTES,
    LATEST_LEGISLATURE + 1,
  ).map(l => {
    const tuple: [number, string] = [
      l,
      `/deputes${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`,
    ]
    return tuple
  })

  const deputesRaw = (
    await sql<types.DeputeRawFromDb>`
    SELECT DISTINCT ON (acteur_uid)
    acteurs.uid,
    nosdeputes_deputes.slug,
    acteurs.data->'etatCivil'->'ident'->>'prenom' AS first_name,
    acteurs.data->'etatCivil'->'ident'->>'nom' AS last_name,
    mandats.data->'election'->'lieu'->>'departement' AS circo_departement,
    mandats.data->>'dateFin' IS NULL AS mandat_ongoing
  FROM acteurs
  INNER JOIN mandats ON acteurs.uid = mandats.acteur_uid
  INNER JOIN organes ON organes.uid = ANY(mandats.organes_uids)
  LEFT JOIN nosdeputes_deputes ON nosdeputes_deputes.uid = acteurs.uid
  WHERE
    organes.data->>'codeType' = 'ASSEMBLEE'
    AND organes.data->>'legislature' = ${legislature.toString()}
  `.execute(dbReleve)
  ).rows

  const deputes: types.DeputeSimple[] = sortBy(
    deputesRaw,
    // this sort can't be done in the SQL
    // incompatible with our DISTINCT clause
    _ => _.last_name,
  ).map(depute => {
    const { first_name, last_name, ...rest } = depute
    return {
      fullName: `${first_name} ${last_name}`,
      firstLetterLastName: last_name[0] ?? 'z',
      ...rest,
    }
  })

  const deputesWithGroup = await addLatestGroupToDeputes(deputes, legislature)
  const groupesData = sortGroupes(
    buildGroupesData(
      deputesWithGroup
        .filter(_ => _.mandat_ongoing)
        .filter(latestGroupIsNotNull),
    ),
  )
  return {
    props: {
      data: {
        legislature,
        legislatureNavigationUrls,
        deputes: deputesWithGroup,
        groupesData,
      },
    },
  }
}
