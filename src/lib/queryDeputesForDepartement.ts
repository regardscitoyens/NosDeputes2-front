import { db } from './db'

export type DeputeInDepartement = {
  id: number
  sexe: 'H' | 'F'
  slug: string
  id_an: string
  nom: string
  nom_de_famille: string
  groupe_acronyme: string
  nom_circo: string
  num_circo: number
}

export async function queryDeputesForDepartement(
  slug: string,
): Promise<DeputeInDepartement[]> {
  const rows = await db
    .selectFrom('parlementaire')
    .where('parlementaire.nom_circo', '=', slug)
    .where(qb =>
      qb
        .where('parlementaire.fin_mandat', '>=', new Date())
        .orWhere('parlementaire.fin_mandat', 'is', null),
    )
    .select('id')
    .select('slug')
    .select('sexe')
    .select('id_an')
    .select('nom')
    .select('nom_de_famille')
    .select('groupe_acronyme')
    .select('nom_circo')
    .select('num_circo')
    .orderBy('num_circo')
    .execute()

  return rows
}
