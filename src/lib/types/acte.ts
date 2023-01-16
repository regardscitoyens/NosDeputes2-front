export type ActeLegislatif = ActeLegislatifEtape | ActeLegislatifConcret

// les "étapes" servent juste à grouper des actes concrets
export type ActeLegislatifEtape = {
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
  actesLegislatifs?: ActeLegislatif[]
  uid: string
  codeActe: string
  organeRef: string
}

// les actes concrets correspondent à des évenements du cycle de vie d'un dossier législatif
export type ActeLegislatifConcret = {
  uid: string
  codeActe: string
  libelleActe: string
  organeRef: string
  // on sait que certains types ont ou n'ont pas cette date, mais c'est plus pratique de déclarer le champ au niveau racine
  dateActe?: string
  // idem
  texteAssocieRef?: string
} & SubtypeOfActeConcret

type SubtypeOfActeConcret =
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
  | {
      xsiType: 'SaisieComAvis_Type'
      libelleActe:
        | "Saisine d'une délégation ou d'un office"
        | "Saisine pour avis d'une commission"
      dateActe: string
    }
  | {
      xsiType: 'ProcedureAccelere_Type'
      libelleActe: "Le gouvernement déclare l'urgence / engage la procédure accélérée"
      dateActe: string
    }
  | {
      xsiType: 'Promulgation_Type'
      libelleActe: "Promulgation d'une loi"
      infoJo: {
        dateJo: string
        numJo: string // number stringified
        typeJo: 'JO_LOI_DECRET'
        referenceNor?: string
        urlLegifrance?: string
      }
      codeLoi: string
      dateActe: string
      titreLoi: string
      texteLoiRef?: string
      referenceNor?: string
      urlLegifrance?: string
      urlEcheancierLoi?: string
      infoJoRect?: {
        dateJo: string
        numJo: string // number stringified
        typeJo: 'JO_LOI_DECRET'
        urlLegifrance?: string
        referenceNor?: string
      }[] // only 1 or 2 items
    }
  | {
      xsiType: 'EtudeImpact_Type'
      libelleActe: "Etude d'impact"
      dateActe: string
      texteAssocieRef: string
      contributionInternaute: { dateOuverture?: string; dateFermeture?: string }
    }
  | {
      xsiType: 'DepotAccordInternational_Type'
      libelleActe: 'Accord international'
      dateActe: string
      texteAssocieRef: string
    }
  | {
      xsiType: 'RenvoiCMP_Type'
      libelleActe: "Convocation d'une CMP"
      dateActe: string
      initiateur: { acteurs: { acteurRef: string; mandatRef: string }[] }
    }
  | {
      xsiType: 'DepotAvisConseilEtat_Type'
      libelleActe: "Avis du Conseil d'Etat"
      dateActe: string
      texteAssocieRef: string
    }
  | {
      xsiType: 'SaisineConseilConstit_Type'
      libelleActe: 'Saisine du conseil constitutionnel'
      dateActe: string
      motif: "En application de l'article 61§2 de la Constitution"
      casSaisine: {
        libelle:
          | 'De droit (article 61 alinéa 1 de la Constitution)'
          | 'Premier Ministre'
          | "Président de l'Assemblée nationale"
          | 'Président de la République'
          | 'Président du Sénat'
          | 'Soixante députés au moins'
          | 'Soixante sénateurs au moins'
      }
      initiateur?: { acteurs: { acteurRef: string }[] }
    }
  | {
      xsiType: 'ConclusionEtapeCC_Type'
      libelleActe: 'Conclusion du conseil constitutionnel'
      dateActe: string
      numDecision: string
      anneeDecision: string
      urlConclusion: string
      statutConclusion:
        | {
            famCode: 'TCD01'
            libelle: 'Confirme'
          }
        | {
            famCode: 'TCD01,'
            libelle: 'TCD01,'
          }
        | {
            famCode: 'TCD02'
            libelle: 'Partiellement conforme'
          }
        | {
            famCode: 'TCD02,'
            libelle: 'TCD02,'
          }
        | {
            famCode: 'TCD03'
            libelle: 'Conforme avec réserve'
          }
        | {
            famCode: 'TCD04'
            libelle: 'Non conforme'
          }
        | {
            famCode: 'TCD04,'
            libelle: 'TCD04,'
          }
    }
  | {
      xsiType: 'DepotMotionCensure_Type'
      libelleActe: 'Motion de censure'
      dateActe: string
      auteursRefs: string[]
      typeMotionCensure: {
        libelle: 'Motion de censure 49-3' | 'Motion de censure 49-2'
      }
    }
  | {
      xsiType: 'DecisionMotionCensure_Type'
      libelleActe: 'Décision sur une motion de censure'
      dateActe: string
      decision: { famCode: 'TSORTMOT02' }
      voteRefs?: [string]
    }
  | {
      xsiType: 'DeclarationGouvernement_Type'
      libelleActe: "Dépôt d'une déclaration du gouvernement"
      dateActe: string
      texteAssocieRef: string
      // TODO fix type, sur http://localhost:3000/dossier/DLR5L16N45988 on voit que c'est un objet avec un libelle et un codeFam
      typeDeclaration: "Déclaration engageant la responsabilité du Gouvernement devant l'Assemblée nationale sur le vote d'un texte"
    }
  | {
      xsiType: 'RetraitInitiative_Type'
      libelleActe: "Retrait d'une initiative"
      dateActe: string
      texteAssocieRef: string
    }
  | {
      xsiType: 'RenvoiPrealable_Type'
      libelleActe: 'Renvoi préalable'
      dateActe: string
    }
  | {
      xsiType: 'CreationOrganeTemporaire_Type'
      libelleActe:
        | "Création d'une commission d'enquête"
        | "Création d'une mission d'information"
      dateActe: string
      initiateur?: { organeRef: string }
    }
  | {
      xsiType: 'DepotLettreRectificative_Type'
      libelleActe: "Dépôt d'une lettre rectificative."
      dateActe: string
      texteAssocieRef: string
    }
  | {
      xsiType: 'Adoption_Europe_Type'
      libelleActe: 'Adoption par les instances communautaires'
      dateActe: string
      infoJoce: {
        refJoce: string
        dateJoce: string
      }
      texteEuropeen: {
        typeTexteEuropeen:
          | 'Acte du Conseil'
          | 'Décision du Conseil'
          | 'Règlement de la Commission'
        titreTexteEuropeen: string
      }
      statutAdoption: { famCode: 'ETTD01'; libelle: 'adopté' }
    }
  | {
      xsiType: 'DepotMotionReferendaire_Type'
      libelleActe: 'Motion référendaire'
      dateActe: string
      auteursRefs?: string[]
    }
  | {
      xsiType: 'DecisionRecevabiliteBureau_Type'
      libelleActe: 'Recevabilité par le Bureau'
      dateActe: { famCode: '02'; libelle: 'irrecevable' }
      decision: string
      formuleDecision: string
    }

export function getChildrenOfActe(acte: ActeLegislatif): ActeLegislatif[] {
  return acte.xsiType === 'Etape_Type' ? acte.actesLegislatifs ?? [] : []
}
