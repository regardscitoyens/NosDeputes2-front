import { WithLatestGroup } from '../../lib/addLatestGroup'
import { AmendementsDeputeSummary } from '../../lib/queryDeputeAmendementsSummary'

export type Props = { depute: Depute }
export type Depute = WithLatestGroup<{
  id: number
  slug: string
  nom: string
  nom_circo: string
  num_circo: number
  date_naissance: string
  profession: string | null
  debut_mandat: string
  fin_mandat: string | null
  id_an: number
  sexe: 'H' | 'F'
  urls: { label: string; url: string }[]
  collaborateurs: { name: string }[]
  mails: string[]
  adresses: string[]
  amendements: AmendementsDeputeSummary
  top: Metrics
}>
export type DeputeCollaborateur = { name: string }
export type DeputeUrls = { label: string; url: string }[]
export type Metrics = { [m in MetricName]: MetricValues }
export type MetricValues = {
  value: number
  rank: number
  max_rank: number
}
export const metricNames = [
  'semaines_presence',
  'commission_presences',
  'commission_interventions',
  'hemicycle_presences',
  'hemicycle_interventions',
  'hemicycle_interventions_courtes',
  'amendements_proposes',
  'amendements_signes',
  'amendements_adoptes',
  'rapports',
  'propositions_ecrites',
  'propositions_signees',
  'questions_ecrites',
  'questions_orales',
] as const
export type MetricName = typeof metricNames[number]
