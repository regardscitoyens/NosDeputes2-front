import { sql } from 'kysely'
import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'
import maxBy from 'lodash/maxBy'
import { NormalizedFonction } from './apiDeputes'
import { db } from './db'

export type SimpleDepute = {
  id: number
  nom: string
  nom_circo: string
  slug: string
  mandatOngoing: boolean
  latestGroup: {
    acronym: string
    function: NormalizedFonction
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
  const selectLastGroup = `
SELECT 
  parlementaire_id,
  MAX(debut_fonction) as debut_fonction
FROM parlementaire_organisme
LEFT JOIN organisme
ON organisme.id = parlementaire_organisme.organisme_id
WHERE type = 'groupe'
GROUP BY parlementaire_id`

  type Row = {
    id: number
    nom: string
    nom_circo: string
    fin_mandat: Date
    slug: string
    parlementaire_groupe_acronyme: string | null
    fonction: string | null
    importance: number
  }
  const query = sql<Row>`
WITH last_group_dates AS (
  SELECT 
    parlementaire_id,
    MAX(debut_fonction) as debut_fonction
  FROM parlementaire_organisme
  LEFT JOIN organisme
  ON organisme.id = parlementaire_organisme.organisme_id
  WHERE type = 'groupe'
  GROUP BY parlementaire_id
)    
SELECT 
  parlementaire.id,
  parlementaire.nom,
  parlementaire.nom_circo,
  parlementaire.fin_mandat,
  parlementaire.slug,
  parlementaire_organisme.parlementaire_groupe_acronyme,
  parlementaire_organisme.fonction,
  parlementaire_organisme.importance
FROM parlementaire
LEFT JOIN last_group_dates
ON parlementaire.id = last_group_dates.parlementaire_id
LEFT JOIN parlementaire_organisme
ON parlementaire_organisme.parlementaire_id = parlementaire.id
AND parlementaire_organisme.debut_fonction = last_group_dates.debut_fonction
LEFT JOIN organisme
ON organisme.id = parlementaire_organisme.organisme_id    
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
      nom_circo,
      slug,
      fin_mandat,
      parlementaire_groupe_acronyme,
      fonction,
      importance,
    }) => {
      const latestGroup =
        parlementaire_groupe_acronyme && fonction
          ? {
              acronym: parlementaire_groupe_acronyme,
              function: normalizeFonctionFromDb(fonction),
            }
          : null
      return {
        id,
        nom,
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
