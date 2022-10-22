import { sql } from 'kysely'
import sortBy from 'lodash/sortBy'
import groupBy from 'lodash/groupBy'
import maxBy from 'lodash/maxBy'
import { NormalizedFonction } from './apiDeputes'
import { db } from './db'

export type SimpleDepute = {
  id: number
  nom: string
  nom_de_famille: string
  prenom: string
  nom_circo: string
  slug: string
  mandatOngoing: boolean
  latestGroup: {
    id: number
    acronym: string
    function: NormalizedFonction
    nom: string
    slug: string
  }
}

function normalizeFonctionFromDb(f: string): NormalizedFonction {
  switch (f) {
    case 'présidente':
    case 'président':
      return 'president'
    case 'apparentée':
    case 'apparenté':
      return 'apparente'
    case 'membre':
      return 'membre'
    default:
      console.log('Warning: unknown fonction', f)
      return 'membre'
  }
}

type DeputesWithAllGroups = {
  id: number
  slug: string
  nom: string
  nom_de_famille: string
  prenom: string
  nom_circo: string
  mandatOngoing: boolean
  groupes: {
    id: number
    acronym: string
    function: NormalizedFonction
    nom: string
    slug: string
    debut_fonction: Date
    fin_fonction: Date | null
  }[]
}

export async function getAllDeputesAndGroupesFromCurrentLegislature(): Promise<
  DeputesWithAllGroups[]
> {
  type Row = {
    parlementaire_id: number
    parlementaire_slug: string
    parlementaire_nom: string
    parlementaire_nom_de_famille: string
    parlementaire_nom_circo: string
    parlementaire_fin_mandat: Date | null
    organisme_id: number
    group_acronym: string
    group_slug: string
    group_nom: string
    fonction: string
    importance: number
    debut_fonction: Date
    fin_fonction: Date | null
  }
  // /!\ this query produces duplicates because :
  // - a parlementaire has had multiple groupes over time
  // - even at the exact same time, a parlementaire is may be linked to the same
  // group multiple times, once as 'membre' and once as 'président' for example
  // We will keep only the one with the max importance
  const query = sql<Row>`
WITH parlementaire_groupe AS (
    SELECT 
        organisme_id,
        parlementaire_id,
        parlementaire_groupe_acronyme AS acronym,
        slug,
        fonction,
        importance,
        debut_fonction,
        fin_fonction,
        nom
    FROM parlementaire_organisme
    INNER JOIN organisme
    ON parlementaire_organisme.organisme_id = organisme.id
    WHERE type = 'groupe'
)
SELECT 
    parlementaire_id,
    parlementaire.slug AS parlementaire_slug,
    parlementaire.nom AS parlementaire_nom,
    parlementaire.nom_de_famille AS parlementaire_nom_de_famille,
    parlementaire.nom_circo AS parlementaire_nom_circo,
    parlementaire.fin_mandat AS parlementaire_fin_mandat,
    organisme_id,
    acronym AS group_acronym,
    parlementaire_groupe.slug AS group_slug,
    parlementaire_groupe.nom AS group_nom,
    fonction,
    importance, 
    debut_fonction,
    fin_fonction
FROM parlementaire
INNER JOIN parlementaire_groupe
ON parlementaire.id = parlementaire_groupe.parlementaire_id
ORDER BY parlementaire_id, organisme_id, debut_fonction, importance
`

  const { rows } = await query.execute(db)

  const rowsByParlementaire = Object.values(
    groupBy(rows, _ => _.parlementaire_id),
  )

  const deputesWithAllGroups = rowsByParlementaire.map(rows => {
    const groupedByGroupAndDate = Object.values(
      groupBy(rows, _ => _.group_acronym + _.debut_fonction),
    )
    // now we may still have duplicates, because in the same group at the same date
    // a parlementaire may be registered for multiple fonction (membre/president)
    // Let's keep only the one with the max importance
    const maxImportanceByGroupAndDate = groupedByGroupAndDate.map(rows => {
      const mostImportantRow = maxBy(rows, _ => _.importance)
      if (mostImportantRow === undefined) {
        throw new Error('Could not find max value of non-empty array')
      }
      return mostImportantRow
    })
    if (rows.length === 0) {
      throw new Error('Empty array after grouping')
    }
    const {
      parlementaire_id,
      parlementaire_slug,
      parlementaire_nom,
      parlementaire_nom_de_famille,
      parlementaire_nom_circo,
      parlementaire_fin_mandat,
    } = rows[0]
    return {
      id: parlementaire_id,
      slug: parlementaire_slug,
      nom: parlementaire_nom,
      nom_de_famille: parlementaire_nom_de_famille,
      prenom: parlementaire_nom
        .replace(parlementaire_nom_de_famille, '')
        .trim(),
      nom_circo: parlementaire_nom_circo,
      mandatOngoing: parlementaire_fin_mandat === null,
      groupes: sortBy(
        maxImportanceByGroupAndDate.map(row => {
          const {
            organisme_id,
            group_acronym,
            group_slug,
            group_nom,
            fonction,
            debut_fonction,
            fin_fonction,
          } = row
          return {
            id: organisme_id,
            acronym: group_acronym,
            function: normalizeFonctionFromDb(fonction),
            nom: group_nom,
            slug: group_slug,
            debut_fonction,
            fin_fonction,
          }
        }),
        _ => _.debut_fonction,
      ),
    }
  })
  return deputesWithAllGroups
}
export async function getAllDeputesFromCurrentLegislature2(): Promise<
  SimpleDepute[]
> {
  const deputes = await getAllDeputesAndGroupesFromCurrentLegislature()
  return deputes.map(depute => {
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
  })
}

export async function getAllDeputesFromCurrentLegislature(): Promise<
  SimpleDepute[]
> {
  // We have to use a subquery because we want the last group for each depute
  // https://stackoverflow.com/questions/14770671/mysql-order-by-before-group-by

  type Row = {
    id: number
    nom: string
    nom_de_famille: string
    nom_circo: string
    fin_mandat: Date
    slug: string
    acronym: string | null
    fonction: string | null
    importance: number
    organisme_id: number | null
    nom_group: string | null
    slug_group: string | null
  }
  const query = sql<Row>`
WITH
parlementaire_groupe AS (
  SELECT 
    organisme_id,
    parlementaire_id,
    parlementaire_groupe_acronyme AS acronym,
    fonction,
    importance,
    debut_fonction,
    slug,
    nom
  FROM parlementaire_organisme
  INNER JOIN organisme
  ON parlementaire_organisme.organisme_id = organisme.id
  WHERE type = 'groupe'	
), 
last_group_dates AS (
  SELECT 
    parlementaire_id,
    MAX(debut_fonction) as debut_fonction
  FROM parlementaire_groupe
  GROUP BY parlementaire_id
)
SELECT 
  parlementaire.id,
  parlementaire.nom,
  parlementaire.nom_de_famille,
  parlementaire.nom_circo,
  parlementaire.fin_mandat,
  parlementaire.slug,
  parlementaire_groupe.acronym,
  parlementaire_groupe.fonction,
  parlementaire_groupe.importance,
  parlementaire_groupe.organisme_id,
  parlementaire_groupe.nom as nom_group,
  parlementaire_groupe.slug as slug_group
FROM parlementaire
LEFT JOIN last_group_dates
ON parlementaire.id = last_group_dates.parlementaire_id
LEFT JOIN parlementaire_groupe
ON parlementaire_groupe.parlementaire_id = parlementaire.id
AND parlementaire_groupe.debut_fonction = last_group_dates.debut_fonction
ORDER BY nom
`

  const { rows } = await query.execute(db)

  // There are some duplicates because in the DB
  // a depute is sometimes both member and president for the same groupe at the same time
  // with exactly the same dates
  // We could do another GROUP BY in SQL but it would start to be a bit complicated

  const resultsWithDuplicates = rows.map(
    ({
      id,
      nom,
      nom_de_famille,
      nom_circo,
      slug,
      fin_mandat,
      acronym,
      fonction,
      importance,
      organisme_id,
      nom_group,
      slug_group,
    }) => {
      const latestGroup =
        acronym && fonction && organisme_id !== null && nom_group && slug_group
          ? {
              acronym,
              function: normalizeFonctionFromDb(fonction),
              id: organisme_id,
              nom: nom_group,
              slug: slug_group,
            }
          : null
      return {
        id,
        nom,
        nom_de_famille,
        prenom: nom.replace(nom_de_famille, '').trim(),
        nom_circo,
        slug,
        mandatOngoing: fin_mandat === null,
        latestGroup,
        importance,
      }
    },
  )
  const grouped = groupBy(resultsWithDuplicates, _ => _.id)
  const finalResult = Object.values(grouped).map(duplicates => {
    const mostImportant = maxBy(duplicates, _ => _.importance)
    if (mostImportant) {
      return mostImportant
    }
    throw new Error('Cannot take max of empty array')
  })
  return finalResult
}
