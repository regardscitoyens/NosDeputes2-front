import { WithLatestGroupOrNull } from '../../lib/addLatestGroup'
import { AmendementsDeputeSummary } from '../../lib/queryDeputeAmendementsSummary'
import { DeputeResponsabilites } from '../../lib/queryDeputeResponsabilites'
import { DeputeVotes } from '../../lib/queryDeputeVotes'

export type Params = {
  slug: string
  legislature?: string
}

export type Props = {
  depute: Depute
  legislatureDates: {
    date_debut: string
    date_fin: string | null
  }
  legislature: number
  legislatureNavigationUrls: [number, string][]
}

export type Depute = WithLatestGroupOrNull<{
  uid: string
  gender: 'H' | 'F'
  slug: string
  full_name: string
  circo_departement: string
  circo_number: number
  date_of_birth: string
  mandats_this_legislature: Mandat[]
  legislatures: number[]
  collaborateurs: Collaborateur[]
  adresses: Adresses
  amendements: AmendementsDeputeSummary
  responsabilites: DeputeResponsabilites
  votes: DeputeVotes
  stats: WeeklyStats<StatsFinal> | null
}>
export type Collaborateur = { full_name: string }

export type Mandat = {
  uid: string
  cause_mandat: string
  cause_fin: string | null
  date_debut: string
  date_fin: string | null
}

export type Adresses = {
  emails: string[]
  facebook: string[]
  linkedin: string[]
  instagram: string[]
  twitter: string[]
  sites_internet: string[]
  adresses_postales: {
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

export type WeeklyStats<A> = { [weekMonday: string]: A }

export type StatsRawFromDb = {
  isVacances: boolean
  nb_presences_hemicycle: number
  nb_presences_commission: number
  nb_participations_hemicycle: number
  nb_participations_commission: number
  mediane_presences_hemicycle: number
  mediane_presences_commission: number
  mediane_presences_total: number
}

export type StatsFinal = {
  isVacances: boolean
  presences: number
  mediane_presences: number
}
