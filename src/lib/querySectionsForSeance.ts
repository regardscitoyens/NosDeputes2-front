import { db } from './db'

export type SeanceSection = {
  id: number
  parent_id: number
  titre: string
  titre_complet: string
  nb_interventions: number | null
}

export async function querySectionsForSeance(
  seanceId: number,
): Promise<SeanceSection[]> {
  return (
    db
      .selectFrom('section')
      .leftJoin('intervention', 'section.id', 'intervention.section_id')
      .select([
        'section.titre as titre',
        'section.titre_complet as titre_complet',
        'section.id as id',
        'section.section_id as parent_id',
        'section.nb_interventions as nb_interventions',
      ])
      .where('section.titre', 'is not', null)
      .where('intervention.seance_id', '=', seanceId)
      .orderBy('intervention.timestamp', 'asc')
      .execute()
      // force section.titre to not be null
      .then(s => s as SeanceSection[])
  )
}
