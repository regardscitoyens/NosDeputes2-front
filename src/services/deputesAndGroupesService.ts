import { sql } from 'kysely'
import groupBy from 'lodash/groupBy'
import { db } from '../repositories/db'
import {
  DeputesWithAllGroups,
  FonctionInGroupe,
  getAllDeputesAndGroupesFromCurrentLegislature as queryAllDeputesAndGroupesFromCurrentLegislature,
  normalizeFonctionInGroup,
} from '../repositories/deputesAndGroupesRepository'
import { GroupeData } from './rearrangeData'

export type SimpleDepute = {
  id: number
  nom: string
  nom_de_famille: string
  nom_circo: string
  slug: string
  mandatOngoing: boolean
  latestGroup: {
    id: number
    acronym: string
    fonction: FonctionInGroupe
    nom: string
    slug: string
  }
}

export type LatestGroupForDepute = {
  id: number
  nom: string
  acronym: string
  fonction: FonctionInGroupe
}

export type WithLatestGroup<D> = D & {
  latestGroup: LatestGroupForDepute
}

export async function addLatestGroupToDeputes<D extends { id: number }>(
  deputes: D[],
): Promise<WithLatestGroup<D>[]> {
  const latestGroupsMap = await fetchLatestGroupsForDeputeIds(
    deputes.map(_ => _.id),
  )

  return deputes.map(depute => {
    if (!latestGroupsMap[depute.id]) {
      throw new Error(`Couldn't find latest group for depute ${depute.id}`)
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

function buildSimpleDepute(depute: DeputesWithAllGroups): SimpleDepute {
  const { groupes, ...restOfDepute } = depute
  if (groupes.length == 0) {
    throw new Error(`Depute ${depute.id} has no groupes`)
  }
  const latestGroup = groupes[groupes.length - 1]
  const { debut_fonction, fin_fonction, ...restOfLatestGroup } = latestGroup
  return {
    ...restOfDepute,
    latestGroup: restOfLatestGroup,
  }
}

export async function fetchDeputesList(): Promise<SimpleDepute[]> {
  const deputes = await queryAllDeputesAndGroupesFromCurrentLegislature()
  return deputes.map(buildSimpleDepute)
}

function withoutMinorPassageInNonInscrit(
  depute: DeputesWithAllGroups,
): DeputesWithAllGroups {
  return {
    ...depute,
    groupes: depute.groupes.filter(
      ({ acronym, debut_fonction, fin_fonction }) => {
        const isNonInscrit = acronym === 'NI'
        const nbDays =
          debut_fonction &&
          fin_fonction &&
          (fin_fonction.getTime() - debut_fonction.getTime()) /
            (1000 * 3600 * 24)
        // Beaucoup de deputes sont en non inscrit pendant quelques jours en début de législature
        const isMinorPassage = nbDays && nbDays < 7
        return !(isNonInscrit && isMinorPassage)
      },
    ),
  }
}

export async function fetchDeputesOfGroupe(acronym: string): Promise<{
  current: SimpleDepute[]
  former: SimpleDepute[]
}> {
  const deputes = (await queryAllDeputesAndGroupesFromCurrentLegislature()).map(
    withoutMinorPassageInNonInscrit,
  )
  const current = deputes
    .map(buildSimpleDepute)
    .filter(_ => _.latestGroup.acronym == acronym)
    .filter(_ => _.mandatOngoing)
  const former = deputes
    .filter(_ => _.groupes.some(_ => _.acronym == acronym))
    .map(buildSimpleDepute)
    .filter(_ => _.latestGroup.acronym != acronym || !_.mandatOngoing)
  return { current, former }
}

export async function fetchGroupList(): Promise<GroupeData[]> {
  const deputes = await fetchDeputesList()
  const deputesGrouped = Object.values(
    groupBy(deputes, _ => _.latestGroup.acronym),
  )
  const groupsWithDeputes = deputesGrouped.map(deputes => {
    const { fonction, ...group } = deputes[0].latestGroup
    return {
      ...group,
      deputesCount: deputes.length,
    }
  })
  const totalDeputes = deputes.length
  return groupsWithDeputes.map(_ => ({
    ..._,
    deputesShareOfTotal: _.deputesCount / totalDeputes,
  }))
}
