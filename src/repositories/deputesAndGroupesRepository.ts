import { sql } from 'kysely'
import sortBy from 'lodash/sortBy'
import groupBy from 'lodash/groupBy'
import maxBy from 'lodash/maxBy'
import { db } from './db'

export type DeputesWithAllGroups = {
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
    fonction: NormalizedFonction
    nom: string
    slug: string
    debut_fonction: Date
    fin_fonction: Date | null
  }[]
}
export type NormalizedFonction = 'president' | 'membre' | 'apparente'

// Big shared query to get deputes, groups, etc.
// Includes all past groupes of each depute
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
  // - even with the same debut_fonction, a parlementaire may be linked to the same
  // group multiple times, once as 'membre' and once as 'président' for example
  //
  // We will group/reorganize the data in JS to clean it
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
            fonction: normalizeFonctionFromDb(fonction),
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
