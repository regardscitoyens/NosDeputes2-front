export type ActeLegislatif = {
  actesLegislatifs?: ActeLegislatif[]
  uid: string
  codeActe: string
} & SubtypeOfActe

type SubtypeOfActe =
  | {
      xsiType: 'DepotInitiative_Type'
      libelleActe: "1er dépôt d'une initiative."
    }
  | {
      xsiType: 'SaisieComFond_Type'
      libelleActe: 'Renvoi en commission au fond'
    }
  | {
      xsiType: 'NominRapporteurs_Type'
      libelleActe:
        | 'Nomination de rapporteur'
        | 'Nomination de rapporteur budgétaire'
    }
  | {
      xsiType: 'DepotRapport_Type'
      libelleActe:
        | "Allocution du Président de l'Assemblée nationale"
        | 'Dépôt de rapport'
        | "Dépôt du rapport d'une CMP"
        | 'Message du président de la république'
        | "Rapport sur l'application des lois"
    }
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
      xsiType: 'Decision_Type'
      libelleActe: 'Décision' | 'Décision de la CMP'
    }
  | {
      xsiType: 'DepotInitiativeNavette_Type'
      libelleActe:
        | "Dépôt d'un projet de loi"
        | "Dépôt d'une initiative en navette"
    }
  | {
      xsiType: 'DiscussionCommission_Type'
      libelleActe: 'Réunion de commission'
    }
  | {
      xsiType: 'DiscussionSeancePublique_Type'
      libelleActe: 'Discussion en séance publique'
    }
  | {
      xsiType: 'MotionProcedure_Type'
      libelleActe: 'Motion de procédure'
    }
  | {
      xsiType: 'SaisieComAvis_Type'
      libelleActe: {
        nomCanonique:
          | "Saisine d'une délégation ou d'un office"
          | "Saisine pour avis d'une commission"
      }
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
