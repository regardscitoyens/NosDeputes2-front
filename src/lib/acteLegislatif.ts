export type ActeLegislatif = {
  actesLegislatifs?: ActeLegislatif[]
  uid: string
  codeActe: string
  libelleActe: string
  organeRef: string
} & SubtypeOfActe

type SubtypeOfActe =
  | {
      xsiType: 'Etape_Type'
      libelleActe:
        | '1ère lecture (1ère assemblée saisie)'
        | '1ère lecture (2ème assemblée saisie)'
        | 'Commission Mixte Paritaire'
        | "Commission d'enquête"
        | 'Conseil constitutionnel'
        | 'Discussion en séance publique'
        | 'Débat'
        | 'Instances communautaires'
        | 'Lecture définitive'
        | 'Lecture unique'
        | 'Mise en application de la loi'
        | "Mission d'information"
        | 'Nouvelle Lecture'
        | 'Promulgation de la loi'
        | 'Renvoi préalable à la CAE'
        | 'Travaux'
        | "Travaux d'une commission saisie pour avis"
        | "Travaux d'une délégation saisie pour avis"
        | 'Travaux de la commission saisie au fond'
        | 'Travaux des commissions'
        | 'deuxième lecture'
        | 'troisième lecture'
    }
  | {
      xsiType: 'DepotInitiative_Type'
      libelleActe: "1er dépôt d'une initiative."
      dateActe: string
      texteAssocieRef: string
    }
  | {
      xsiType: 'SaisieComFond_Type'
      libelleActe: 'Renvoi en commission au fond'
      dateActe: string
    }
  | {
      xsiType: 'NominRapporteurs_Type'
      libelleActe: 'Nomination de rapporteur'
      dateActe: string
      rapporteurs: {
        acteurRef: string
        typeRapporteur:
          | 'rapporteur'
          | 'rapporteur général'
          | 'rapporteur pour avis'
      }[]
    }
  | {
      xsiType: 'NominRapporteurs_Type'
      libelleActe: 'Nomination de rapporteur budgétaire'
      dateActe: string
      rapporteurs: {
        acteurRef: string
        typeRapporteur: 'rapporteur pour avis' | 'rapporteur spécial'
        etudePlfRef?: string
      }[]
    }
  | {
      xsiType: 'DepotRapport_Type'
      libelleActe: 'Dépôt de rapport' | "Dépôt du rapport d'une CMP"
      dateActe: string
      texteAssocieRef: string
      texteAdopteRef?: string
    }
  | {
      xsiType: 'DepotRapport_Type'
      libelleActe:
        | "Allocution du Président de l'Assemblée nationale"
        | 'Message du président de la république'
        | "Rapport sur l'application des lois"
      dateActe: string
      texteAssocieRef: string
    }
  | {
      xsiType: 'Decision_Type'
      libelleActe: 'Décision'
      dateActe: string
      statutConclusion?: {
        famCode:
          | 'TCCMP01'
          | 'TCCMP02'
          | 'TMRC01'
          | 'TSORTF01'
          | 'TSORTF02'
          | 'TSORTF03'
          | 'TSORTF04'
          | 'TSORTF05'
          | 'TSORTF06'
          | 'TSORTF07'
          | 'TSORTF13'
          | 'TSORTF14'
          | 'TSORTF18'
          | 'TSORTF19'
          | 'TSORTF20'
          | 'TSORTF21'
          | 'TSORTF23'
          | 'TSORTMOT01'
        // the libelle almost corresponds to the code, but the texts varies a bit too much
        libelle: string
      }
      textesAssocies?: { typeTexte: 'BTA' | 'TAP'; texteAssocieRef: string }[]
      reunionRef?: string
      voteRefs?: string[]
    }
  | {
      xsiType: 'Decision_Type'
      libelleActe: 'Décision de la CMP'
      dateActe: string
      statutConclusion?:
        | {
            famCode: 'TCCMP01'
            libelle: 'Accord'
          }
        | {
            famCode: 'TCCMP02'
            libelle: 'Désaccord'
          }
    }
  | {
      xsiType: 'DepotInitiativeNavette_Type'
      libelleActe: "Dépôt d'un projet de loi"
      dateActe: string
      provenanceRef: string
      texteAssocieRef: string
    }
  | {
      xsiType: 'DepotInitiativeNavette_Type'
      libelleActe: "Dépôt d'une initiative en navette"
      dateActe: string
      provenanceRef: string
      texteAssocieRef: string
      depotInitialLectureDefinitiveRef?: string
    }
  | {
      xsiType: 'DiscussionCommission_Type'
      libelleActe: 'Réunion de commission'
      dateActe: string
      odjRef?: string
      reunionRef?: string
    }
  | {
      xsiType: 'DiscussionSeancePublique_Type'
      libelleActe: 'Discussion en séance publique'
      dateActe: string
      odjRef: string
      reunionRef: string
    }
  | {
      xsiType: 'MotionProcedure_Type'
      libelleActe: 'Motion de procédure'
      dateActe: string
      typeMotion: {
        libelle: 'Question préalable' | 'Motions de renvoi en commission'
      }
      auteurMotion?: string
    }
  //TODO continue here
  | {
      xsiType: 'SaisieComAvis_Type'
      libelleActe:
        | "Saisine d'une délégation ou d'un office"
        | "Saisine pour avis d'une commission"
    }
  | {
      xsiType: 'ProcedureAccelere_Type'
      libelleActe: "Le gouvernement déclare l'urgence / engage la procédure accélérée"
    }
  | {
      xsiType: 'Promulgation_Type'
      libelleActe: "Promulgation d'une loi"
    }
  | {
      xsiType: 'EtudeImpact_Type'
      libelleActe: "Etude d'impact"
    }
  | {
      xsiType: 'DepotAccordInternational_Type'
      libelleActe: 'Accord international'
    }
  | {
      xsiType: 'RenvoiCMP_Type'
      libelleActe: "Convocation d'une CMP"
    }
  | {
      xsiType: 'DepotAvisConseilEtat_Type'
      libelleActe: "Avis du Conseil d'Etat"
    }
  | {
      xsiType: 'SaisineConseilConstit_Type'
      libelleActe: 'Saisine du conseil constitutionnel'
    }
  | {
      xsiType: 'ConclusionEtapeCC_Type'
      libelleActe: 'Conclusion du conseil constitutionnel'
    }
  | {
      xsiType: 'DepotMotionCensure_Type'
      libelleActe: 'Motion de censure'
    }
  | {
      xsiType: 'DecisionMotionCensure_Type'
      libelleActe: 'Décision sur une motion de censure'
    }
  | {
      xsiType: 'DeclarationGouvernement_Type'
      libelleActe: "Dépôt d'une déclaration du gouvernement"
    }
  | {
      xsiType: 'RetraitInitiative_Type'
      libelleActe: "Retrait d'une initiative"
    }
  | {
      xsiType: 'RenvoiPrealable_Type'
      libelleActe: 'Renvoi préalable'
    }
  | {
      xsiType: 'CreationOrganeTemporaire_Type'
      libelleActe:
        | "Création d'une commission d'enquête"
        | "Création d'une mission d'information"
    }
  | {
      xsiType: 'DepotLettreRectificative_Type'
      libelleActe: "Dépôt d'une lettre rectificative."
    }
  | {
      xsiType: 'Adoption_Europe_Type'
      libelleActe: 'Adoption par les instances communautaires'
    }
  | {
      xsiType: 'DepotMotionReferendaire_Type'
      libelleActe: 'Motion référendaire'
    }
  | {
      xsiType: 'DecisionRecevabiliteBureau_Type'
      libelleActe: 'Recevabilité par le Bureau'
    }
