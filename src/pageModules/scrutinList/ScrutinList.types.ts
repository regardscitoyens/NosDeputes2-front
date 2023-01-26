export type Params = {
  legislature?: string
}
export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  scrutins: Scrutin[]
}

export type Scrutin = {
  uid: string
  title: string
  numero: string
  seance_ref: string
  sort: 'adopté' | 'rejeté'
  type_vote: {
    typeMajorite:
      | 'majorité absolue des suffrages exprimés'
      // on pourrait harmoniser ça côté CLI
      | "majorité des membres composant l'Assemblée nationale"
      | "majorité des membres composants composant l'Assemblée"
      | "majorité des membres composants composant l'Assemblée nationale"
    codeType: 'MOC' | 'SAT' | 'SPO' | 'SPS'
    libelleTypeVote: // Les motions de censure "MOC" sont tantôt labellisées "motion de censure" ou "scrutin public solennel"
    | 'motion de censure'
      | 'scrutin public solennel'
      | 'scrutin à la tribune'
      | 'scrutin public ordinaire'
      | 'scrutin public solennel'
  }
  // plein de valeurs possibles, mais elles pourraient être un peu analysées et traitées sous forme plus gérable
  demandeur_texte: string
  date_scrutin: string
  mode_publication_des_votes:
    | 'DecompteNominatif'
    | 'DecompteDissidentsPositionGroupe'
  // pas encore requêté
  // -------
  synthese_vote: {
    nombreVotants: string
    suffragesExprimes: string
    nbrSuffragesRequis: string
    decompte: DecompteVoix
  }
  ventilationVotes: {
    groupes: {
      organeRef: string
      nombreMembresGroupe: string
      vote: {
        decompteVoix: DecompteVoix
        decompteNominatif: {
          pour: SingleVote[]
          contre: SingleVote[]
          absentions: SingleVote[]
          nonVotants: NonVotantVote[]
        }
        positionMajoritaire: 'pour' | 'contre' | 'abstention'
      }
    }[]
  }
  miseAuPoint?: {
    pour: BaseSingleVote[]
    contre: BaseSingleVote[]
    abstentions: BaseSingleVote[]
    nonVotants: BaseSingleVote[]
    nonVotantsVolontaires: BaseSingleVote[]
    dysfonctionnement?: {
      pour: BaseSingleVote[]
      contre: BaseSingleVote[]
      abstentions: BaseSingleVote[]
      nonVotants: BaseSingleVote[]
      nonVotantsVolontaires: BaseSingleVote[]
    }
  }
}

type DecompteVoix = {
  pour: '0'
  contre: '0'
  nonVotants: '1'
  abstentions: '0'
  nonVotantsVolontaires: '0'
}

type SingleVote = BaseSingleVote & {
  parDelegation?: false | true // not sure what it means when undefined ? maybe check on the original file, maybe tricoteuses strips it for no reason
}

type NonVotantVote = BaseSingleVote & {
  // Raison pour laquelle un acteur n’as pas voté malgré sa présence. MG pour membre du gouvernement, PAN pour président de l’Assemblée nationale, PSE pour président de séance.
  causePositionVote: 'MG' | 'PAN' | 'PSE'
}

type BaseSingleVote = {
  acteurRef: string
  mandatRef: string
}
