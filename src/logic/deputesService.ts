import { sql } from 'kysely'
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
  } | null
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
