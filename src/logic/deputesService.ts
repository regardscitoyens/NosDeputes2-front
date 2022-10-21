import { sql } from 'kysely'
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
  parlementaire_organisme.fonction
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

  // TODO fix : pk j'ai pas le bon nb de deputes ? des doublons
  return rows.map(
    ({
      id,
      nom,
      nom_circo,
      slug,
      fin_mandat,
      parlementaire_groupe_acronyme,
      fonction,
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
      }
    },
  )
}
