import { sql } from 'kysely'
import { db } from './db'

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
