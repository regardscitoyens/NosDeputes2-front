import { sql } from 'kysely'
import range from 'lodash/range'
import { GetServerSideProps } from 'next'
import { addLatestComPermToDeputes } from '../../lib/addLatestComPerm'
import { addLatestGroupToDeputes } from '../../lib/addLatestGroup'
import { dbReleve } from '../../lib/dbReleve'
import {
  FIRST_LEGISLATURE_FOR_DEPUTES,
  LATEST_LEGISLATURE,
} from '../../lib/hardcodedData'
import * as types from './ComPermList.types'

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
        destination: `/commissions-permanentes`,
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
      `/commissions-permanentes${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`,
    ]
    return tuple
  })

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

  const deputesWithGroupAndComPerm = await addLatestComPermToDeputes(
    deputesWithGroup,
    legislature,
  )

  return {
    props: {
      data: {
        legislature,
        legislatureNavigationUrls,
        deputes: deputesWithGroupAndComPerm,
      },
    },
  }
}
