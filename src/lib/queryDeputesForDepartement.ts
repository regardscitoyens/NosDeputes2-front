import { sql } from 'kysely'
import { dbReleve } from './dbReleve'
import { LATEST_LEGISLATURE } from './hardcodedData'
import {
  addLatestGroupToDeputes,
  WithLatestGroupOrNull,
} from './addLatestGroup'

export type DeputeInDepartement = WithLatestGroupOrNull<{
  uid: string
  slug: string | null
  full_name: string
  circo_departement: string
  circo_number: number
}>

export async function queryDeputesForDepartement(
  nomDepartement: string,
): Promise<DeputeInDepartement[]> {
  const legislature = LATEST_LEGISLATURE
  // quite similar to the query for DeputeList. Could maybe be mutualized
  const deputesRaw = (
    await sql<{
      uid: string
      slug: string | null
      first_name: string
      last_name: string
      circo_departement: string
      circo_number: number
    }>`
SELECT DISTINCT ON (acteur_uid)
  acteurs.uid,
  nosdeputes_deputes.slug,
  acteurs.data->'etatCivil'->'ident'->>'prenom' AS first_name,
  acteurs.data->'etatCivil'->'ident'->>'nom' AS last_name,
  mandats.data->'election'->'lieu'->>'departement' AS circo_departement,
  (mandats.data->'election'->'lieu'->>'numCirco')::int AS circo_number
FROM acteurs
INNER JOIN mandats ON acteurs.uid = mandats.acteur_uid
INNER JOIN organes ON organes.uid = ANY(mandats.organes_uids)
LEFT JOIN nosdeputes_deputes ON nosdeputes_deputes.uid = acteurs.uid
WHERE
  organes.data->>'codeType' = 'ASSEMBLEE'
  AND organes.data->>'legislature' = ${legislature.toString()}
  AND mandats.data->>'dateFin' IS NULL
  AND mandats.data->'election'->'lieu'->>'departement' = ${nomDepartement}
  `.execute(dbReleve)
  ).rows

  const deputes = deputesRaw.map(depute => {
    const { first_name, last_name, ...rest } = depute
    return {
      ...rest,
      full_name: `${first_name} ${last_name}`,
    }
  })
  return addLatestGroupToDeputes(deputes, legislature)
}
