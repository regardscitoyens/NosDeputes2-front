import { db } from './db'

export type BasicGroupInfo = {
  acronym: string
  nom: string
}

export async function queryGroupInfo(acronym: string): Promise<BasicGroupInfo> {
  const foo = await db
    .selectFrom('organisme')
    .innerJoin(
      'parlementaire_organisme',
      'parlementaire_organisme.organisme_id',
      'organisme.id',
    )
    .select(['nom', 'parlementaire_groupe_acronyme'])
    .where('parlementaire_groupe_acronyme', '=', acronym)
    .where('type', '=', 'groupe')
    .executeTakeFirst()
  if (!foo) {
    throw new Error(`Didn't find group with acronym ${acronym}`)
  }
  return {
    nom: foo.nom,
    acronym: foo.parlementaire_groupe_acronyme,
  }
}
