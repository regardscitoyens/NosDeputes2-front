import { sql } from 'kysely'
import _ from 'lodash'
import sortBy from 'lodash/sortBy'
import { chunkBy } from '../services/utils'
import { db } from './db'

export type DeputesWithAllOrganisms = {
  id: number
  slug: string
  nom: string
  nom_de_famille: string
  prenom: string
  nom_circo: string
  mandatOngoing: boolean
  organisms: {
    id: number
    fonction: FonctionInOrganisme
    nom: string
    slug: string
    debut_fonction: Date
  }[]
}

export type OrganismeWithCounts = {
  id: number
  nom: string
  slug: string
  deputesCount: number
  seancesCount: number
}

export type OrganismeType = 'extra' | 'parlementaire'

export async function queryOrganismsList(
  type: OrganismeType,
): Promise<OrganismeWithCounts[]> {
  const { count } = db.fn
  const subqueryNbSeances = db
    .selectFrom('organisme')
    .leftJoin('seance', 'seance.organisme_id', 'organisme.id')
    .where('organisme.type', '=', type)
    .groupBy('organisme.id')
    .select('organisme.id as organisme_id')
    .select(count<number>('seance.id').as('cpt'))

  const subqueryNbDeputes = db
    .selectFrom('organisme')
    .leftJoin(
      'parlementaire_organisme',
      'organisme.id',
      'parlementaire_organisme.organisme_id',
    )
    .leftJoin(
      'parlementaire',
      'parlementaire.id',
      'parlementaire_organisme.parlementaire_id',
    )
    .where('organisme.type', '=', type)
    .where('fin_fonction', 'is', null)
    .groupBy('organisme.id')
    .select('organisme.id as organisme_id')
    .select(count<number>('parlementaire.id').as('cpt'))

  const rows = await db
    .selectFrom('organisme')
    .leftJoin(
      subqueryNbDeputes.as('organisme_to_parlementaire_count'),
      'organisme.id',
      'organisme_to_parlementaire_count.organisme_id',
    )
    .leftJoin(
      subqueryNbSeances.as('organisme_to_seance_count'),
      'organisme_to_seance_count.organisme_id',
      'organisme.id',
    )
    .where('organisme.slug', '!=', 'gouvernement')
    .where('organisme.type', '=', type)
    .groupBy('organisme.id')
    .orderBy('created_at')
    .select('organisme.id as id')
    .select('organisme.slug as slug')
    .select('organisme.nom as nom')
    .select(
      sql<number>`COALESCE(organisme_to_seance_count.cpt, 0)`.as(
        'seancesCount',
      ),
    )
    .select(
      sql<number>`COALESCE(organisme_to_parlementaire_count.cpt, 0)`.as(
        'deputesCount',
      ),
    )
    .execute()
  return rows
}

// Big shared query to get deputes, their current organisms, etc.
export async function getAllDeputesAndCurrentOrganismesFromCurrentLegislature(
  organismeType: 'extra' | 'parlementaire',
): Promise<DeputesWithAllOrganisms[]> {
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
    .where('organisme.type', '=', organismeType)
    .where('fin_fonction', '!=', null)
    // on exclut le gouvernement, pas intéressant
    // et ça étendrait considérablement le nombre de fonctions possibles
    .where('organisme.slug', '!=', 'gouvernement')
    .select('parlementaire_id')
    .select('parlementaire.slug as parlementaire_slug')
    .select('parlementaire.nom as parlementaire_nom')
    .select('parlementaire.nom_de_famille as parlementaire_nom_de_famille')
    .select('parlementaire.nom_circo as parlementaire_nom_circo')
    .select('parlementaire.fin_mandat as parlementaire_fin_mandat')
    .select('organisme_id')
    .select('organisme.slug as group_slug')
    .select('organisme.nom as group_nom')
    .select('fonction')
    .select('debut_fonction')
    .execute()

  const rowsByParlementaire = chunkBy(rows, _ => _.parlementaire_id)
  const deputesWithAllOrganisms = rowsByParlementaire.map(rows => {
    const rowsForEachOrganismsAndDate = chunkBy(
      rows,
      _ => _.organisme_id.toString() + ' ' + _.debut_fonction,
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
      organisms: sortBy(
        rowsForEachOrganismsAndDate.map(row => {
          const {
            organisme_id,
            group_slug,
            group_nom,
            fonction,
            debut_fonction,
          } = row
          return {
            id: organisme_id,
            fonction: normalizeFonctionInOrganisme(fonction),
            nom: group_nom,
            slug: group_slug,
            debut_fonction,
          }
        }),
        _ => _.debut_fonction,
      ),
    }
  })
  return deputesWithAllOrganisms
}

const fonctionsWithFeminineVersion = {
  membre: null,
  'membre avec voix délibérative': null,
  'membre avec voix consultative': null,
  apparenté: 'apparentée',
  président: 'présidente',
  questeur: 'questeure',
  'vice-président': 'vice-présidente',
  secrétaire: null,
  'rapporteur général': 'rapporteure générale',
  'membre de droit': null,
  'membre suppléant': 'membre suppléante',
  'membre titulaire': null,
  rapporteur: 'rapporteure',
  'co-rapporteur': 'co-rapporteure',
  'président délégué': 'présidente délégué',
  'membre nommé': 'membre nommée',
  'deuxième vice-président': 'deuxième vice-présidente',
  'président de droit': 'présidente de droit',
  'membre du bureau': null,
  'chargé de mission': 'chargée de mission',
  'co-président': 'co-présidente',
} as const

type FonctionInOrganisme = keyof typeof fonctionsWithFeminineVersion

function normalizeFonctionInOrganisme(f: string): FonctionInOrganisme {
  const entry = Object.entries(fonctionsWithFeminineVersion).find(([k, v]) => {
    return f === k || f === v
  }) as [FonctionInOrganisme, string | null] | undefined
  if (entry) {
    return entry[0]
  }
  console.log('Warning: unknown fonction', f)
  return 'membre'
}
