import { sql } from 'kysely'
import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'
import { dbReleve } from './dbReleve'

export type LatestComPermForDepute = {
  fonction: FonctionInCom
  name_short: string
  name_long: string
  ongoing: boolean
}

export type FonctionInCom =
  | 'Président'
  | 'Membre'
  | 'Rapporteur général'
  | 'Secrétaire'
  | 'Vice-Président'

export type WithLatestComPermOrNull<D> = D & {
  latestComPerm: LatestComPermForDepute | null
}
export type WithLatestComPerm<D> = D & {
  latestComPerm: LatestComPermForDepute
}

export async function addLatestGroupToDepute<D extends { uid: string }>(
  depute: D,
  legislature: number,
): Promise<WithLatestComPermOrNull<D>> {
  return (await addLatestComPermToDeputes([depute], legislature))[0]
}

// For a given type of depute D, fetch for each of them their latest group
// and add it as a new field
export async function addLatestComPermToDeputes<D extends { uid: string }>(
  deputes: D[],
  legislature: number,
): Promise<WithLatestComPermOrNull<D>[]> {
  if (deputes.length === 0) return []
  const latestComPermMap = await fetchLatestComPermForDeputeIds(
    deputes.map(_ => _.uid),
    legislature,
  )

  return deputes.map(depute => {
    if (!latestComPermMap[depute.uid]) {
      return { ...depute, latestComPerm: null }
    }
    const latestComPerm = latestComPermMap[depute.uid]
    return {
      ...depute,
      latestComPerm,
    }
  })
}

export function latestComPermIsNotNull<D>(
  depute: WithLatestComPermOrNull<D>,
): depute is WithLatestComPerm<D> {
  return depute.latestComPerm !== null
}

export function latestComPermIsNull<D>(
  depute: WithLatestComPermOrNull<D>,
): depute is D & { latestComPerm: null } {
  return depute.latestComPerm === null
}

async function fetchLatestComPermForDeputeIds(
  deputeUids: string[],
  legislature: number,
): Promise<{ [uid: string]: LatestComPermForDepute | null }> {
  // https://stackoverflow.com/questions/16914098/how-to-select-id-with-max-date-group-by-category-in-postgresql

  const { rows } = await sql<{
    acteur_uid: string
    fonction: FonctionInCom | null
    name_short: string | null
    name_long: string | null
    ongoing: boolean
  }>`
SELECT
DISTINCT ON (acteurs.uid)
  acteurs.uid as acteur_uid,
  mandats.data->'infosQualite'->>'codeQualite' as fonction,
  organes.data->>'libelleAbrege' as name_short,
  organes.data->>'libelle' as name_long,
  mandats.data->>'dateFin' IS NULL as ongoing
FROM acteurs
LEFT JOIN mandats
  ON mandats.acteur_uid = acteurs.uid
INNER JOIN organes
  ON organes.uid = ANY(mandats.organes_uids)
WHERE
  organes.data->>'codeType' = 'COMPER'
  AND mandats.data->>'legislature' = ${legislature.toString()}
  AND acteurs.uid IN (${sql.join(deputeUids)})
ORDER BY
  acteurs.uid, mandats.data->>'dateFin' DESC NULLS FIRST, mandats.data->>'preseance'
  `.execute(dbReleve)

  const res = mapValues(
    groupBy(rows, _ => _.acteur_uid),
    ([row]) => {
      const { fonction, name_short, name_long, ongoing } = row
      if (fonction == null || name_short == null || name_long == null) {
        return null
      }
      return {
        fonction,
        name_short,
        name_long,
        ongoing,
      }
    },
  )
  return res
}
