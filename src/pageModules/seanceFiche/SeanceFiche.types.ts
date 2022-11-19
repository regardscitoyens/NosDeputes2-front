import { SeanceSummary } from '../../lib/seanceSummary'

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
  id: number
  source: string
  nb_commentaires: number | null
  nb_mots: number
  md5: string
  intervention: string
  timestamp: number
  section_id: number | null
  type: 'loi' | 'commission' | 'question'
  personnalite_id: number | null
  parlementaire_id: number | null
  parlementaire_groupe_acronyme: string | null
  fonction: string | null
  parent_section_id: number | null
}

export interface InterventionParlementaire extends Intervention {
  parlementaire: {
    nom: string
    slug: string
    id_an: number
  }
}
export function isInterventionParlementaire(
  intervention: Intervention,
): intervention is Intervention & InterventionParlementaire {
  return (intervention as InterventionParlementaire).parlementaire !== undefined
}

export interface InterventionPersonnalite extends Intervention {
  personnalite: {
    nom: string
  }
}
export function isInterventionPersonnalite(
  intervention: Intervention,
): intervention is InterventionPersonnalite {
  return (intervention as InterventionPersonnalite).personnalite !== undefined
}

export interface InterventionSection extends Intervention {
  section: {
    titre: string
    depth: 1 | 2
  }
}

export function isInterventionSection(
  intervention: Intervention,
): intervention is InterventionSection {
  return (intervention as InterventionSection).section !== undefined
}
