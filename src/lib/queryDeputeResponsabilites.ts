import { sql } from 'kysely'
import { db } from './db'
import { OrganismeType } from './queryOrganismsList'

export type DeputeResponsabilite = {
  nom: string
  slug: string
  type: string
  fonction: string | null
}

export type DeputeResponsabilites = DeputeResponsabilite[]

export async function queryDeputeResponsabilites(
  id: number,
): Promise<DeputeResponsabilites> {
  const { count } = db.fn

  const responsabilites = await db
    .selectFrom('organisme')
    .leftJoin(
      'parlementaire_organisme',
      'parlementaire_organisme.organisme_id',
      'organisme.id',
    )
    .where('parlementaire_organisme.parlementaire_id', '=', id)
    .where(qb =>
      qb
        .where(sql`parlementaire_organisme.fin_fonction IS NULL`)
        .orWhere(sql`parlementaire_organisme.fin_fonction >= NOW()`),
    )
    .groupBy('organisme.id')
    .select('organisme.nom')
    .select('organisme.slug')
    .select('organisme.type')
    .select('parlementaire_organisme.fonction')
    .execute()

  return responsabilites
}
