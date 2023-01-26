import { sql } from 'kysely'
import range from 'lodash/range'
import { GetStaticPaths, GetStaticProps } from 'next'
import {
  addLatestComPermToDeputes,
  latestComPermIsNotNull,
  latestComPermIsNull,
} from '../../lib/addLatestComPerm'
import { addLatestGroupToDeputes } from '../../lib/addLatestGroup'
import { dbReleve } from '../../lib/dbReleve'
import {
  FIRST_LEGISLATURE_FOR_DEPUTES,
  LATEST_LEGISLATURE,
} from '../../lib/hardcodedData'
import * as types from './ComPermList.types'

const basePath = '/commissions-permanentes'

const availableLegislatures = range(
  FIRST_LEGISLATURE_FOR_DEPUTES,
  LATEST_LEGISLATURE + 1,
)

function buildUrlForLegislature(l: number): string {
  return `${basePath}${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`
}

function buildLegislatureNavigationUrls(): [number, string][] {
  return availableLegislatures.map(l => {
    const tuple: [number, string] = [l, buildUrlForLegislature(l)]
    return tuple
  })
}

export const getStaticPaths: GetStaticPaths<types.Params> = () => {
  const paths = availableLegislatures
    .filter(_ => _ !== LATEST_LEGISLATURE)
    .map(_ => ({
      params: { legislature: _.toString() },
    }))
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<
  types.Props,
  types.Params
> = async context => {
  const legislatureParam = context.params?.legislature
  const legislature = legislatureParam
    ? parseInt(legislatureParam, 10)
    : LATEST_LEGISLATURE
  const legislatureNavigationUrls = buildLegislatureNavigationUrls()

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
