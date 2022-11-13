import { db } from './db'

export type DeputeResponsabilite = {
  section_id: number
  titre: string | null
  fonction: string | null
}

export type DeputeDossiers = DeputeResponsabilite[]

// select `section`.`section_id` from `section` left join `section` as `s2` on `s2`.`id` = `section`.`id
export async function queryDeputeDossiers(id: number): Promise<DeputeDossiers> {
  const { count } = db.fn

  const dossiers = await db
    .selectFrom('section')
    .leftJoin('section as s2', 's2.id', 'section.section_id')
    .leftJoin('intervention', 'intervention.section_id', 'section.section_id')
    .where('intervention.parlementaire_id', '=', id)
    .where('intervention.nb_mots', '>', 20)

    .groupBy('section.id')
    .select('section.section_id')
    .select('s2.titre')
    .select('intervention.fonction')
    .select(count<number>('intervention.id').as('nb'))

    .execute()

  return dossiers
}
