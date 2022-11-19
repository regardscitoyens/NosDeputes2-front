import { GetServerSideProps } from 'next'
import { db } from '../../lib/db'
import { parseIntOrNull } from '../../lib/utils'

import * as types from './SeanceFiche.types'
import { querySectionsForSeance } from '../../lib/querySectionsForSeance'
import { buildSeanceSummary, SeanceSummary } from '../../lib/seanceSummary'
import {
  Intervention,
  InterventionParlementaire,
  InterventionPersonnalite,
  InterventionSection,
} from './SeanceFiche.types'

export type InterventionQueryType = {
  intervention_id: number
  intervention_source: string
  intervention_nb_commentaires: number | null
  intervention_nb_mots: number
  intervention_md5: string
  intervention_intervention: string
  intervention_timestamp: number
  intervention_section_id: number | null
  intervention_type: 'loi' | 'commission' | 'question'
  intervention_personnalite_id: number | null
  intervention_parlementaire_id: number | null
  intervention_parlementaire_groupe_acronyme: string | null
  intervention_fonction: string | null
  parlementaire_nom: string | null
  parlementaire_slug: string | null
  parlementaire_id_an: number | null
  personnalite_nom: string | null
  section_titre: string | null
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const idStr = context.query.id as string
  // in php it can be an array of ids to retrieve multiple seances but it doesn't seem to work
  // https://www.nosdeputes.fr/16/seance/283,286 only displays seance 283
  const seanceId = parseIntOrNull(idStr)

  if (seanceId === null) {
    return {
      notFound: true,
    }
  }
  const seance = await db
    .selectFrom('seance')
    .leftJoin('intervention', 'seance.id', 'intervention.seance_id')
    .leftJoin('presence', 'seance.id', 'presence.seance_id')
    .leftJoin('preuve_presence', 'presence.id', 'preuve_presence.presence_id')
    .where('seance.id', '=', seanceId)
    .select([
      'seance.id',
      'seance.type',
      'seance.date',
      'seance.moment',
      'seance.session',
      'seance.organisme_id',
      'seance.tagged',
      'seance.nb_commentaires',
      'intervention.seance_id',
      eb =>
        eb.fn.count<number>('intervention.id').distinct().as('n_interventions'),
      'presence.seance_id',
      eb =>
        eb.fn
          .count<number>('presence.parlementaire_id')
          .distinct()
          .as('presents'),
      eb =>
        eb.fn.count<number>('preuve_presence.type').distinct().as('sources'),
    ])
    .groupBy('seance.id')
    .orderBy('seance.date')
    .orderBy('seance.moment')
    .executeTakeFirst()

  if (seance === undefined) {
    return {
      notFound: true,
    }
  }

  // pour les séances de commission (il n'en existe pas encore pour cette legislature)
  const organisme = await db
    .selectFrom('organisme')
    .where('organisme.id', '=', seance.organisme_id)
    .select(['organisme.nom', 'organisme.slug'])
    .executeTakeFirst()
  // TODO des redirect en fonction de l'organisme ?

  const presencesIds = await db
    .selectFrom('preuve_presence')
    .select('preuve_presence.id')
    .leftJoin('presence', 'preuve_presence.presence_id', 'presence.id')
    .where('presence.seance_id', '=', seanceId)
    .execute()

  // Note : pas de gestion du paramètre "ok" qui semble permettre de modifier les données dans la base

  const sections = await querySectionsForSeance(seanceId)
  const seanceSummary = buildSeanceSummary(sections)

  const interventions = await db
    .selectFrom('intervention')
    .leftJoin(
      'parlementaire',
      'intervention.parlementaire_id',
      'parlementaire.id',
    )
    .leftJoin('personnalite', 'intervention.personnalite_id', 'personnalite.id')
    // TODO on récupère déjà les sections juste au dessus pour faire le résumé, éviter d'appeler la table 2 fois ?
    .leftJoin('section', 'intervention.section_id', 'section.id')
    .where('seance_id', '=', seanceId)
    .select([
      'intervention.id as intervention_id',
      'intervention.source as intervention_source',
      'intervention.source as intervention_source',
      'intervention.nb_commentaires as intervention_nb_commentaires',
      'intervention.nb_mots as intervention_nb_mots',
      'intervention.md5 as intervention_md5',
      'intervention.intervention as intervention_intervention',
      'intervention.timestamp as intervention_timestamp',
      'intervention.section_id as intervention_section_id',
      'intervention.type as intervention_type',
      'intervention.personnalite_id as intervention_personnalite_id',
      'intervention.parlementaire_id as intervention_parlementaire_id',
      'intervention.parlementaire_groupe_acronyme as intervention_parlementaire_groupe_acronyme',
      'intervention.fonction as intervention_fonction',
      'parlementaire.nom as parlementaire_nom',
      'parlementaire.slug as parlementaire_slug',
      'parlementaire.id_an as parlementaire_id_an',
      'personnalite.nom as personnalite_nom',
      'section.titre as section_titre',
    ])
    .execute()
    .then(interventions => createInterventions(interventions, seanceSummary))

  const finalData: types.Props = {
    seance: {
      ...seance,
      date: seance.date.toISOString(),
    },
    organisme: organisme ?? null,
    interventions,
    seanceSummary,
  }
  return {
    props: {
      data: finalData,
    },
  }
}

function createInterventions(
  interventions: InterventionQueryType[],
  seanceSummary: SeanceSummary,
): Intervention[] {
  const result: (
    | InterventionParlementaire
    | InterventionPersonnalite
    | InterventionSection
    | Intervention
  )[] = []
  let parentSectionId: number | null = null
  const topLevelSectionIds = new Set(seanceSummary.sections.map(s => s.id))

  for (const intervention of interventions) {
    const base = {
      id: intervention.intervention_id,
      source: intervention.intervention_source,
      nb_commentaires: intervention.intervention_nb_commentaires,
      nb_mots: intervention.intervention_nb_mots,
      md5: intervention.intervention_md5,
      intervention: intervention.intervention_intervention,
      timestamp: intervention.intervention_timestamp,
      section_id: intervention.intervention_section_id,
      type: intervention.intervention_type,
      personnalite_id: intervention.intervention_personnalite_id,
      parlementaire_id: intervention.intervention_parlementaire_id,
      parlementaire_groupe_acronyme:
        intervention.intervention_parlementaire_groupe_acronyme,
      fonction: intervention.intervention_fonction,
      parent_section_id: parentSectionId,
    }
    if (
      intervention.parlementaire_id_an !== null &&
      intervention.parlementaire_slug !== null &&
      intervention.parlementaire_nom !== null
    ) {
      const parlementaire: InterventionParlementaire['parlementaire'] = {
        id_an: intervention.parlementaire_id_an,
        slug: intervention.parlementaire_slug,
        nom: intervention.parlementaire_nom,
      }
      result.push({ ...base, parlementaire })
    } else if (intervention.personnalite_nom !== null) {
      const personnalite: InterventionPersonnalite['personnalite'] = {
        nom: intervention.personnalite_nom,
      }
      result.push({ ...base, personnalite })
    }
    // first intervention of each section is the section
    else if (
      intervention.section_titre !== null &&
      intervention.intervention_section_id !== null &&
      intervention.intervention_section_id !== parentSectionId
    ) {
      parentSectionId = intervention.intervention_section_id
      const section: InterventionSection['section'] = {
        titre: intervention.section_titre,
        depth: topLevelSectionIds.has(intervention.intervention_section_id)
          ? 1
          : 2,
      }
      result.push({ ...base, section })
    } else {
      // didascalie
      result.push(base)
    }
  }
  return result
}
