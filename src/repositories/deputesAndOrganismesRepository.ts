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

export type OrganismeType = 'extra' | 'parlementaire' | 'groupes'

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

export type DeputeInOrganisme = {
  id: number
  slug: string
  nom: string
  nom_de_famille: string
  nom_circo: string
  mandatOngoing: boolean
  fonction: FonctionInOrganisme
  currentMember: boolean
}

export async function queryDeputesForOrganisme(
  slug: string,
): Promise<DeputeInOrganisme[]> {
  const rows = await db
    .selectFrom('organisme')
    .innerJoin(
      'parlementaire_organisme',
      'organisme.id',
      'parlementaire_organisme.organisme_id',
    )
    .innerJoin(
      'parlementaire',
      'parlementaire.id',
      'parlementaire_organisme.parlementaire_id',
    )
    .where('organisme.slug', '=', slug)
    .where(qb =>
      qb
        // Remove the very short passages, there's a bunch of them at least for commission des finances
        .where(sql`TIMESTAMPDIFF(DAY, debut_fonction, fin_fonction)`, '>', '1')
        .orWhere('fin_fonction', 'is', null),
    )
    .groupBy('parlementaire.id')
    .select('parlementaire.id as id')
    .select('parlementaire.slug as slug')
    .select('parlementaire.nom as nom')
    .select('parlementaire.nom_de_famille as nom_de_famille')
    .select('parlementaire.nom_circo as nom_circo')
    .select('parlementaire_organisme.fonction as fonction')
    .select('fin_mandat')
    .select(
      sql<0 | 1>`MAX(parlementaire_organisme.fin_fonction IS NULL)`.as(
        'has_null_fin_fonction',
      ),
    )
    .execute()
  const rowsMapped = rows.map(
    ({
      id,
      slug,
      nom,
      nom_de_famille,
      nom_circo,
      fonction,
      fin_mandat,
      has_null_fin_fonction,
    }) => ({
      id,
      slug,
      nom,
      nom_de_famille,
      nom_circo,
      fonction: normalizeFonctionInOrganisme(fonction),
      mandatOngoing: fin_mandat === null,
      currentMember: has_null_fin_fonction === 1,
    }),
  )
  return rowsMapped
}

export const fonctionsWithFeminineVersion = {
  'président délégué': 'présidente délégué',
  'président de droit': 'présidente de droit',
  président: 'présidente',
  'co-président': 'co-présidente',
  'vice-président': 'vice-présidente',
  'deuxième vice-président': 'deuxième vice-présidente',
  questeur: 'questeure',
  secrétaire: null,
  'rapporteur général': 'rapporteure générale',
  rapporteur: 'rapporteure',
  'co-rapporteur': 'co-rapporteure',
  'chargé de mission': 'chargée de mission',
  'membre du bureau': null,
  'membre avec voix délibérative': null,
  'membre avec voix consultative': null,
  'membre de droit': null,
  'membre titulaire': null,
  'membre nommé': 'membre nommée',
  membre: null,
  'membre suppléant': 'membre suppléante',
  apparenté: 'apparentée',
} as const

export type FonctionInOrganisme = keyof typeof fonctionsWithFeminineVersion

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
