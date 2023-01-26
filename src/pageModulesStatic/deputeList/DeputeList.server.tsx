import { sql } from 'kysely'
import sortBy from 'lodash/sortBy'
import { GetStaticPaths, GetStaticProps } from 'next'
import {
  addLatestGroupToDeputes,
  latestGroupIsNotNull,
} from '../../lib/addLatestGroup'
import { buildGroupesData } from '../../lib/buildGroupesData'
import { dbReleve } from '../../lib/dbReleve'
import {
  FIRST_LEGISLATURE_FOR_DEPUTES,
  sortGroupes,
} from '../../lib/hardcodedData'
import {
  buildLegislaturesNavigationUrls,
  buildStaticPaths,
  readLegislatureFromContext,
} from '../../lib/routingUtils'
import * as types from './DeputeList.types'

const basePath = '/deputes'
const firstLegislature = FIRST_LEGISLATURE_FOR_DEPUTES

export const getStaticPaths: GetStaticPaths<types.Params> = () => {
  return buildStaticPaths(firstLegislature)
}

export const getStaticProps: GetStaticProps<
  types.Props,
  types.Params
> = async context => {
  const legislature = readLegislatureFromContext(context)
  const legislatureNavigationUrls = buildLegislaturesNavigationUrls(
    firstLegislature,
    basePath,
  )

  const deputesRaw = (
    await sql<types.DeputeRawFromDb>`
    SELECT DISTINCT ON (acteur_uid)
    acteurs.uid,
    nosdeputes_deputes.slug,
    acteurs.data->'etatCivil'->'ident'->>'prenom' AS first_name,
    acteurs.data->'etatCivil'->'ident'->>'nom' AS last_name,
    mandats.data->'election'->'lieu'->>'departement' AS circo_departement,
    CASE
    	WHEN mandats.data->>'dateFin' IS NULL THEN TRUE
    	WHEN organes.data->'viMoDe'->>'dateFin' IS NULL THEN FALSE
    	WHEN mandats.data->>'dateFin' < organes.data->'viMoDe'->>'dateFin' THEN FALSE
      ELSE TRUE
	  END AS mandat_ongoing
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
      legislature,
      legislatureNavigationUrls,
      deputes: deputesWithGroup,
      groupesData,
    },
  }
}
