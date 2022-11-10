import { SeanceSummary } from '../../lib/seanceSummary'

export type Props = {
  seance: Seance
  organisme: Organisme | null
  seanceSummary: SeanceSummary
}

export type Seance = {
  id: number
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
