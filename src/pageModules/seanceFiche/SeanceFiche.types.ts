import { SeanceSummary } from '../../lib/seanceSummary'
import { NonNullableField } from '../../lib/utils'

export type Props = {
  seance: Seance
  organisme: Organisme | null
  seanceSummary: SeanceSummary
  interventions: Intervention[]
}

export type Seance = {
  id: number
  type: 'hemicycle' | 'commission'
  date: string
  moment: string
  session: string
  organisme_id: number
  tagged: number | null
  nb_commentaires: number | null
  seance_id: number | null
  n_interventions: number | null
  presents: number | null
  sources: number | null
}

export type Organisme = {
  nom: string
  slug: string
}

export type Intervention = {
  // TODO remove prefix ?
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
  // TODO nested object ?
  parlementaire_nom: string | null
  parlementaire_slug: string | null
  parlementaire_id_an: number | null
  // TODO nested object ?
  personnalite_nom: string | null
  // TODO nested object ?
  section_titre: string | null
}

export type InterventionParlementaire = NonNullableField<
  Intervention,
  'parlementaire_slug' | 'parlementaire_id_an' | 'parlementaire_nom'
>
export function isInterventionParlementaire(
  intervention: Intervention,
): intervention is InterventionParlementaire {
  return (
    intervention.parlementaire_slug !== null &&
    intervention.parlementaire_id_an !== null &&
    intervention.parlementaire_nom !== null
  )
}

export type InterventionPersonnalite = NonNullableField<
  Intervention,
  'personnalite_nom'
>
export function isInterventionPersonnalite(
  intervention: Intervention,
): intervention is InterventionPersonnalite {
  return intervention.personnalite_nom !== null
}

export type InterventionWithSectionTitre = NonNullableField<
  Intervention,
  'intervention_section_id' | 'section_titre'
>
export function hasSectionTitre(
  intervention: Intervention,
): intervention is InterventionWithSectionTitre {
  return (
    intervention.intervention_section_id !== null &&
    intervention.section_titre !== null
  )
}
