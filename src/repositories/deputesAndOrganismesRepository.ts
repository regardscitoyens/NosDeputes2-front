import { sql } from 'kysely'
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

export type OrganismeBasicData = {
  id: number
  nom: string
}

export async function queryOrganismeBasicData(
  slug: string,
): Promise<OrganismeBasicData | null> {
  const res = await db
    .selectFrom('organisme')
    .where('slug', '=', slug)
    .select('id')
    .select('nom')
    .executeTakeFirst()
  return res ?? null
}

export async function queryDeputesForOrganisme(slug: string): Promise<void> {
  const rows = await db
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
    .where('organisme.slug', '=', slug)
    .groupBy('parlementaire.id')
    .select('parlementaire.id as id')
    .select('parlementaire.slug as slug')
    .select('parlementaire.nom as nom')
    .select('parlementaire_organisme.fonction as fonction')
    .select(
      sql<0 | 1>`MAX(parlementaire_organisme.fin_mandat IS NULL)`.as(
        'has_null_fin_mandat',
      ),
    )
    .execute()
  // TODO en fait c'est pas bon, on pas les infos de groupe pour ces deputes... faire une second query ? => yes faire une query générique "get latest group for a bunch of depute ids"
  // TODO traduire la "fonction"
  return {
    current: rows.filter(_ => _.has_null_fin_mandat === 0),
    former: rows.filter(_ => _.has_null_fin_mandat === 1),
  }
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
