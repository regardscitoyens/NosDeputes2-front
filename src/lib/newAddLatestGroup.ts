import { sql } from 'kysely'
import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'
import { dbReleve } from './dbReleve'
import { colorsForGroupsOldLegislatures } from './hardcodedData'

export type LatestGroupForDepute = {
  nom: string
  acronym: string
  fonction: NewFonctionInGroupe
  color: string
}

export type NewFonctionInGroupe =
  | 'Président'
  | 'Membre apparenté'
  | 'Membre'
  | 'Député non-inscrit'

export type WithLatestGroupOrNull<D> = D & {
  latestGroup: LatestGroupForDepute | null
}
export type WithLatestGroup<D> = D & {
  latestGroup: LatestGroupForDepute
}

export async function addLatestGroupToDepute<D extends { uid: string }>(
  depute: D,
  legislature: number,
): Promise<WithLatestGroupOrNull<D>> {
  return (await addLatestGroupToDeputes([depute], legislature))[0]
}

// For a given type of depute D, fetch for each of them their latest group
// and add it as a new field
export async function addLatestGroupToDeputes<D extends { uid: string }>(
  deputes: D[],
  legislature: number,
): Promise<WithLatestGroupOrNull<D>[]> {
  const latestGroupsMap = await fetchLatestGroupsForDeputeIds(
    deputes.map(_ => _.uid),
    legislature,
  )

  return deputes.map(depute => {
    if (!latestGroupsMap[depute.uid]) {
      return { ...depute, latestGroup: null }
    }
    const latestGroup = latestGroupsMap[depute.uid]
    return {
      ...depute,
      latestGroup,
    }
  })
}

// We often want to filter out the few deputes without a group
// (only happens in rare cases where the deputes resigned on their first day)
export function latestGroupIsNotNull<D>(
  depute: WithLatestGroupOrNull<D>,
): depute is WithLatestGroup<D> {
  return depute.latestGroup !== null
}
async function fetchLatestGroupsForDeputeIds(
  deputeUids: string[],
  legislature: number,
): Promise<{ [uid: string]: LatestGroupForDepute | null }> {
  // https://stackoverflow.com/questions/16914098/how-to-select-id-with-max-date-group-by-category-in-postgresql

  const { rows } = await sql<{
    acteur_uid: string
    fonction: NewFonctionInGroupe | null
    acronym: string | null
    nom: string
    color: string
  }>`
SELECT
DISTINCT ON (acteurs.uid)
  acteurs.uid as acteur_uid,
  mandats.data->'infosQualite'->>'codeQualite' as fonction,
  organes.data->>'libelleAbrev' as acronym,
  organes.data->>'libelle' as nom,
  organes.data->>'couleurAssociee' as color
FROM acteurs
LEFT JOIN mandats
  ON mandats.acteur_uid = acteurs.uid
INNER JOIN organes
  ON organes.uid = ANY(mandats.organes_uids)
WHERE
  organes.data->>'codeType' = 'GP'
  AND organes.data->>'legislature' = ${legislature.toString()}
  AND acteurs.uid IN (${sql.join(deputeUids)})
ORDER BY
  acteurs.uid, mandats.data->>'dateFin' DESC NULLS FIRST,
  (mandats.data->>'preseance')::int ASC
`.execute(dbReleve)

  const res = mapValues(
    groupBy(rows, _ => _.acteur_uid),
    ([row]) => {
      const { fonction, acronym, nom, color } = row
      if (fonction == null || acronym == null || nom == null) {
        return null
      }
      const colorWithFallback =
        color ?? colorsForGroupsOldLegislatures[acronym] ?? '#FFFFFF'
      return { fonction, acronym, nom, color: colorWithFallback }
    },
  )
  return res
}
