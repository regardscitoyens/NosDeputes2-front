import { sql } from 'kysely'
import { db } from './db'
import { OrganismeType } from './queryOrganismsList'

export type DeputeResponsabilite = {
  nom: string
  slug: string
  type: "parlementaire" | "extra" | "groupe" | "groupes"
  fonction: string
}

export type DeputeResponsabilites = DeputeResponsabilite[]

export async function queryDeputeResponsabilites(
  id: number,
): Promise<DeputeResponsabilites> {
  const responsabilites = await db
    .selectFrom('organisme')
    .innerJoin(
      'parlementaire_organisme',
      'parlementaire_organisme.organisme_id',
      'organisme.id',
    )
    .where('parlementaire_organisme.parlementaire_id', '=', id)
    .where(sql`parlementaire_organisme.fin_fonction IS NULL`)
    .groupBy('organisme.id')
    .select('organisme.nom')
    .select('organisme.slug')
    .select('organisme.type')
    .select('parlementaire_organisme.fonction')
    .execute()

  return responsabilites
}
