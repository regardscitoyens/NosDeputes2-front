import { sql } from 'kysely'
import { db } from './db'
import { FonctionInGroupe, normalizeFonctionInGroup } from './hardcodedData'

export type LatestGroupForDepute = {
  id: number
  nom: string
  acronym: string
  fonction: FonctionInGroupe
}

export type WithLatestGroup<D> = D & {
  latestGroup: LatestGroupForDepute | null
}

// For a given type of depute D, fetch for each of them their latest group
// and add it as a new field
export async function addLatestGroupToDeputes<D extends { id: number }>(
  deputes: D[],
): Promise<WithLatestGroup<D>[]> {
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

export async function addLatestGroupToDepute<D extends { id: number }>(
  depute: D,
): Promise<WithLatestGroup<D>> {
  return (await addLatestGroupToDeputes([depute]))[0]
}

export async function fetchLatestGroupsForDeputeIds(
  deputeIds: number[],
): Promise<{ [id: number]: LatestGroupForDepute }> {
  // base join between the 3 tables
  const baseQuery = db
    .selectFrom('parlementaire')
    .innerJoin(
      'parlementaire_organisme',
      'parlementaire.id',
      'parlementaire_organisme.parlementaire_id',
    )
    .innerJoin(
      'organisme',
      'organisme.id',
      'parlementaire_organisme.organisme_id',
    )
    .where('organisme.type', '=', 'groupe')

  // We need a subquery to get the max fin_fonction
  // If we did the GROUP BY in a single query, the selected group
  // would be randomly selected
  const subquery = baseQuery
    .groupBy('parlementaire.id')
    .select('parlementaire.id as parlementaire_id')
    .select(
      sql<Date | null>`IF(max(fin_fonction IS NULL) = 0, max(fin_fonction), NULL)`.as(
        'max_fin_fonction',
      ),
    )

  const rows = await baseQuery
    .innerJoin(
      subquery.as('subquery'),
      'subquery.parlementaire_id',
      'parlementaire.id',
    )
    .whereRef(
      'parlementaire_organisme.fin_fonction',
      '<=>',
      'subquery.max_fin_fonction',
    )
    .where('parlementaire.id', 'in', deputeIds)
    // on groupe encore par parlementaire, au cas où le même parlementaire aurait plusieurs groupes avec la même fin_fonction (normalement non)
    .groupBy('parlementaire.id')
    .select('parlementaire_organisme.parlementaire_id')
    .select('parlementaire_organisme.parlementaire_groupe_acronyme as acronym')
    .select('parlementaire_organisme.fonction')
    .select('organisme.id as group_id')
    .select('organisme.nom as nom')
    .execute()

  const result = Object.fromEntries(
    rows.map(_ => {
      const { parlementaire_id, acronym, fonction, group_id, nom } = _
      const group = {
        acronym,
        id: group_id,
        nom,
        fonction: normalizeFonctionInGroup(fonction),
      }
      return [parlementaire_id, group]
    }),
  )
  return result
}
