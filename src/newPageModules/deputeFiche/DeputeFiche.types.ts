import { WithLatestGroupOrNull } from '../../lib/newAddLatestGroup'
import { AmendementsDeputeSummary } from '../../lib/queryDeputeAmendementsSummary'
import { DeputeResponsabilites } from '../../lib/queryDeputeResponsabilites'
import { DeputeVotes } from '../../lib/queryDeputeVotes'

export type Props = { depute: Depute; currentLegislature: number }
export type Depute = WithLatestGroupOrNull<{
  uid: string
  slug: string
  full_name: string
  circo_departement: string
  circo_number: number
  date_of_birth: string
  mandats_this_legislature: Mandat[]
  legislatures: number[]
  collaborateurs: { name: string }[]
  adresses: {
    emails: string[]
    facebook: string[]
    linkedin: string[]
    instagram: string[]
    twitter: string[]
    site_internet: string[]
    postales: {
      uid: string
      typeLibelle:
        | 'Adresse officielle'
        | 'Adresse publiée de circonscription'
        | 'Adresse publiée pour Paris ou sa région'
      ville?: string
      nomRue?: string | null
      numeroRue?: string
      codePostal?: string
      intitule?: string | null
      complementAdresse?: string | null
    }[]
  }
  amendements: AmendementsDeputeSummary
  responsabilites: DeputeResponsabilites
  top: Metrics
  votes: DeputeVotes
  // TMP, for quick forwarding and log in front
  other?: any
}>
export type DeputeCollaborateur = { name: string }
export type DeputeUrls = { label: string; url: string }[]
export type Metrics = { [m in MetricName]: MetricValues }
export type MetricValues = {
  value: number
  rank: number
  max_rank: number
}
export type Mandat = {
  uid: string
  cause_mandat: string
  cause_fin: string | null
  date_debut: string
  date_fin: string | null
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

export type AdresseInDb = (
  | {
      xsiType: 'AdresseMail_Type'
      typeLibelle: 'Mèl'
      valElec: string
    }
  | {
      xsiType: 'AdressePostale_Type'
      typeLibelle:
        | 'Adresse officielle'
        | 'Adresse publiée de circonscription'
        | 'Adresse publiée pour Paris ou sa région'
      ville?: string
      nomRue?: string
      numeroRue?: string
      codePostal?: string
      intitule?: string
      complementAdresse?: string
      poids: string // les poids les plus petits doivent apparaitre en premier
    }
  | {
      xsiType: 'AdresseSiteWeb_Type'
      typeLibelle:
        | 'Facebook'
        | 'Linkedin'
        | 'Instagram'
        | 'Twitter'
        | 'Site internet'
        | 'Url sénateur'
      valElec: string
    }
  | {
      xsiType: 'AdresseSiteWeb_Type'
      typeLibelle: 'Linkedin'
      valElec: string
    }
  | {
      xsiType: 'AdresseTelephonique_Type'
      typeLibelle: 'Téléphone' | 'Télécopie' | 'Contact presse'
      adresseDeRattachement?: string
      valElec: string
    }
) & {
  uid: string
}
