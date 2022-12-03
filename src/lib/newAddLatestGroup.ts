import { sql } from 'kysely'
import { dbLegacy } from './dbLegacy'
import { dbReleve } from './dbReleve'
import {
  CURRENT_LEGISLATURE,
  FonctionInGroupe,
  normalizeFonctionInGroup,
} from './hardcodedData'

export type LatestGroupForDepute = {
  // id: number
  // nom: string
  acronym: string
  fonction: FonctionInGroupe
}

export type WithLatestGroupOrNull<D> = D & {
  latestGroup: LatestGroupForDepute | null
}
export type WithLatestGroup<D> = D & {
  latestGroup: LatestGroupForDepute
}

// For a given type of depute D, fetch for each of them their latest group
// and add it as a new field
export async function addLatestGroupToDeputes<D extends { id: number }>(
  deputes: D[],
): Promise<WithLatestGroupOrNull<D>[]> {
  const latestGroupsMap = await fetchLatestGroupsForDeputeIds(
    deputes.map(_ => _.id),
  )

  return deputes.map(depute => {
    if (!latestGroupsMap[depute.id]) {
      return { ...depute, latestGroup: null }
    }
    const latestGroup = latestGroupsMap[depute.id]
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

export async function addLatestGroupToDepute<D extends { id: number }>(
  depute: D,
): Promise<WithLatestGroupOrNull<D>> {
  return (await addLatestGroupToDeputes([depute]))[0]
}

type FonctionInGroupe =
  | 'Président'
  | 'Membre apparenté'
  | 'Membre'
  | 'Député non-inscrit'

export async function fetchLatestGroupsForDeputeIds(
  deputeUids: string[],
): Promise<{ [uid: string]: LatestGroupForDepute }> {
  // https://stackoverflow.com/questions/16914098/how-to-select-id-with-max-date-group-by-category-in-postgresql

  // TODO ajouter where sur les deputeUids
  const { rows } = await sql<
    {
      acteur_uid: string
      organe_uid: string | null
      codeQualite: FonctionInGroupe | null
      libelleAbrev: string | null
      libelle: string
    }[]
  >`
SELECT
DISTINCT ON (acteurs.uid)
  acteurs.uid as acteur_uid,
  organes.data as organe_uid,
  mandats.data->'infosQualite'->>'codeQualite',
  organes.data->>'libelleAbrev',
  organes.data->>'libelle'
FROM acteurs
LEFT JOIN join mandats
  ON mandats.acteur_uid = acteurs.uid
INNER JOIN organes
  ON organes.uid = ANY(mandats.organes_uids)
WHERE
  organes.data->>'codeType' = 'GP'
  AND organes.data->>'legislature' = '${CURRENT_LEGISLATURE}'
ORDER BY
  acteurs.uid, mandats.data->>'dateFin' DESC NULLS FIRST,
  (mandats.data->>'preseance')::int ASC
`.execute(dbReleve)

  // TODO rassembler le groupe dans un sous object
  // TODO si les champs du groupe sont null, faire un sous object null
  return rows.map(({ uid, codeQualite, libelleAbrev, libelle }) => {
    return {
      uid,
    }
  })
}
