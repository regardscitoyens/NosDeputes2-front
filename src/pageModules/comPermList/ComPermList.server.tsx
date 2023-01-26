import { sql } from 'kysely'
import { GetStaticPaths, GetStaticProps } from 'next'
import {
  addLatestComPermToDeputes,
  latestComPermIsNotNull,
  latestComPermIsNull,
} from '../../lib/addLatestComPerm'
import { addLatestGroupToDeputes } from '../../lib/addLatestGroup'
import { dbReleve } from '../../lib/dbReleve'
import { FIRST_LEGISLATURE_FOR_DEPUTES } from '../../lib/hardcodedData'
import {
  buildLegislaturesNavigationUrls,
  buildStaticPaths,
  readLegislatureFromContext,
} from '../../lib/routingUtils'
import * as types from './ComPermList.types'

const basePath = '/commissions-permanentes'

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
  CONCAT(
    acteurs.data->'etatCivil'->'ident'->>'prenom',
    ' ',
    acteurs.data->'etatCivil'->'ident'->>'nom'
  ) as full_name,
  mandats.data->'election'->'lieu'->>'departement' AS circo_departement
FROM acteurs
INNER JOIN mandats ON acteurs.uid = mandats.acteur_uid
INNER JOIN organes ON organes.uid = ANY(mandats.organes_uids)
LEFT JOIN nosdeputes_deputes ON nosdeputes_deputes.uid = acteurs.uid
WHERE
  organes.data->>'codeType' = 'ASSEMBLEE'
  AND (
    mandats.data->>'dateFin' IS NULL
    OR
    mandats.data->>'dateFin' >= organes.data->'viMoDe'->>'dateFin'
  )
  AND organes.data->>'legislature' = ${legislature.toString()}
  `.execute(dbReleve)
  ).rows

  const deputes: types.DeputeSimple[] = deputesRaw.map(depute => {
    const { full_name, ...rest } = depute
    return {
      ...rest,
      fullName: full_name,
    }
  })

  const deputesWithGroup = await addLatestGroupToDeputes(deputes, legislature)

  const deputesWithGroupAndComPerm = (
    await addLatestComPermToDeputes(deputesWithGroup, legislature)
  ).map(_ => {
    const { latestComPerm, ...rest } = _
    return {
      ...rest,
      // on ne s'intéresse pas aux anciennes commissions
      latestComPerm: latestComPerm?.ongoing ? latestComPerm : null,
    }
  })

  const deputesWithCom = deputesWithGroupAndComPerm.filter(
    latestComPermIsNotNull,
  )
  const deputesWithoutCom =
    deputesWithGroupAndComPerm.filter(latestComPermIsNull)

  return {
    props: {
      legislature,
      legislatureNavigationUrls,
      deputesWithCom,
      deputesWithoutCom,
    },
  }
}
