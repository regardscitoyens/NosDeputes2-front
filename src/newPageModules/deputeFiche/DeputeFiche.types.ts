import { WithLatestGroupOrNull } from '../../lib/newAddLatestGroup'
import { AmendementsDeputeSummary } from '../../lib/queryDeputeAmendementsSummary'
import { DeputeResponsabilites } from '../../lib/queryDeputeResponsabilites'
import { DeputeVotes } from '../../lib/queryDeputeVotes'

export type Props = { depute: Depute }
export type Depute = WithLatestGroupOrNull<{
  uid: string
  slug: string
  full_name: string
  circoDepartement: string
  circoNumber: number
  dateOfBirth: string
  debut_mandat: string
  fin_mandat: string | null
  urls: { label: string; url: string }[]
  collaborateurs: { name: string }[]
  mails: string[]
  adresses: string[]
  amendements: AmendementsDeputeSummary
  responsabilites: DeputeResponsabilites
  top: Metrics
  votes: DeputeVotes
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
