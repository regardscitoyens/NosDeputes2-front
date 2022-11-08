import sortBy from 'lodash/sortBy'
import { chunkBy } from './utils'
import { db } from './db'
import { FonctionInGroupe, normalizeFonctionInGroup } from './hardcodedData'

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
    fonction: FonctionInGroupe
    nom: string
    slug: string
    debut_fonction: Date
    fin_fonction: Date | null
  }[]
}

// Big shared query to get deputes, groups, etc.
// Includes all past groupes of each depute
export async function queryDeputesWithAllGroupes(): Promise<
  DeputesWithAllGroups[]
> {
  // this query produces duplicates because a parlementaire has had multiple groupes over time
  // We will group/reorganize the data in JS to clean it
  const rows = await db
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
    .select('parlementaire_id')
    .select('parlementaire.slug as parlementaire_slug')
    .select('parlementaire.nom as parlementaire_nom')
    .select('parlementaire.nom_de_famille as parlementaire_nom_de_famille')
    .select('parlementaire.nom_circo as parlementaire_nom_circo')
    .select('parlementaire.fin_mandat as parlementaire_fin_mandat')
    .select('organisme_id')
    .select('parlementaire_groupe_acronyme as group_acronym')
    .select('organisme.slug as group_slug')
    .select('organisme.nom as group_nom')
    .select('fonction')
    .select('debut_fonction')
    .select('fin_fonction')
    .execute()

  const rowsByParlementaire = chunkBy(rows, _ => _.parlementaire_id)
  const deputesWithAllGroups = rowsByParlementaire.map(rows => {
    const rowsForEachGroupAndDate = chunkBy(
      rows,
      _ => _.group_acronym + _.debut_fonction,
    ).map(_ => _[0])
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
        rowsForEachGroupAndDate.map(row => {
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
            fonction: normalizeFonctionInGroup(fonction),
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
