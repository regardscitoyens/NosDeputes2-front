import { WithLatestGroupOrNull } from '../../lib/addLatestGroup'

export type Params = {
  legislature?: string
}
export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  dataByCirco: DerivedDeputesMandatsFinal[]
}

export type DerivedDeputesMandatsFinal = {
  circo: DerivedDeputesMandatsRawFromDb['circo']
  mandats: {
    depute: WithLatestGroupOrNull<{
      uid: string
      fullName: string
      circo_departement: string
      slug: string | null
      mandat_ongoing: boolean
      gender: 'F' | 'M'
    }>
    cause_fin?: CauseChangement
    date_debut_mandat: string
    date_fin_mandat: string | null
    is_suppleant: boolean
  }[][]
}

export type DerivedDeputesMandatsRawFromDb = {
  legislature: number
  circo: {
    region_type: string
    region: string
    num_dpt: string
    name_dpt: string
    num_circo: string
    ref_circo: string
  }
  mandats: {
    acteur_uid: string
    cause_debut: CauseChangement
    cause_fin?: CauseChangement
    date_debut_mandat: string
    date_fin_mandat: string | null
    full_name: string
    suppleant_ref: string | null
    mandat_uid: string
  }[][]
  nb_mandats: number
}

export type CauseChangement =
  | {
      kind: 'elections_generales'
    }
  | {
      kind: 'remplacement'
      details:
        | 'demission_incompatibilite_mandats'
        | 'decede'
        | 'mission_longue'
        | 'nomme_cc'
        | 'nomme_gvt'
    }
  | {
      kind: 'retour'
      details: 'retour_gvt'
    }
  | {
      kind: 'elections_partielles'
      details?:
        | 'decede_sans_suppleant'
        | 'dechu'
        | 'demission'
        | 'demission_incompatibilite'
        | 'elu_parlement_europeen'
        | 'elu_senat'
        | 'annulation_election'
    }
