// Very complicated object
// Types written manually. Some fields I left unknown
// See also : https://data.tricoteuses.fr/doc/assemblee/actes/schemas.html#actelegislatif.json

export type Dossier = {
  actesLegislatifs?: ActeRacine[]
  fusionDossier?: {
    cause: 'Dossier absorbé' | 'Examen commun'
    dossierAbsorbantRef: string
  }
  indexation: unknown // https://data.tricoteuses.fr/doc/assemblee/document.html#indexation.json
  initiateur?: Initiateur
  legislature: string // c'est un nombre stringifié
  plf?: Plf
  procedureParlementaire: {
    libelle:
      | "Allocution du Président de l'Assemblée nationale"
      | "Commission d'enquête"
      | 'Engagement de la responsabilité gouvernementale'
      | 'Immunité'
      | 'Message du président de la république'
      | "Mission d'information"
      | 'Motion référendaire'
      | 'Projet de loi de financement de la sécurité sociale'
      | "Projet de loi de finances de l'année"
      | 'Projet de loi de finances rectificative'
      | 'Projet de loi ordinaire'
      | 'Projet de ratification des traités et conventions'
      | 'Projet ou proposition de loi constitutionnelle'
      | 'Projet ou proposition de loi organique'
      | 'Proposition de loi ordinaire'
      | "Proposition de loi présentée en application de l'article 11 de la Constitution"
      | "Rapport d'information sans mission"
      | 'Responsabilité pénale du président de la république'
      | 'Résolution'
      | 'Résolution Article 34-1'
  }
  titreDossier: {
    titre: string
    senatChemin?: string
    titreChemin: string
  }
  uid: string
  xsiType:
    | 'DossierCommissionEnquete_Type'
    | 'DossierIniativeExecutif_Type'
    | 'DossierLegislatif_Type'
    | 'DossierMissionControle_Type'
    | 'DossierMissionInformation_Type'
    | 'DossierResolutionAN'
}

type Plf = {
  uid: string
  ordreDiqs: string // c'est un nombre stringifié
  organeRef: string
  rapporteurs?: {
    acteurRef: string
    typeRapporteur: 'rapporteur pour avis' | 'rapporteur spécial'
  }[]
  texteAssocie?: string
  missionMinefi?: {
    missions?: [
      {
        typeBudget:
          | 'Budget général'
          | 'Compte de concours financier'
          | 'Compte spécial'
          | 'Première partie'
        libelleLong: string
        typeMission: 'partie de mission' | 'mission secondaire'
        libelleCourt: string
      },
    ]
    typeBudget:
      | 'Budget général'
      | 'Compte de concours financier'
      | 'Compte spécial'
      | 'Première partie'
    libelleLong: string
    typeMission: 'mission principale'
    libelleCourt: string
  }
  ordreCommission: '1'
}[]

// J'ai séparé le type des actes au premier niveau des niveaux suivants
// pas sûr que ce soit utile, on verra
export type ActeRacine = {
  uid: string
  xsiType: 'Etape_Type'
  codeActe: string
  libelleActe: {
    nomCanonique:
      | '1ère lecture (1ère assemblée saisie)'
      | '1ère lecture (2ème assemblée saisie)'
      | 'Commission Mixte Paritaire'
      | 'Conseil constitutionnel'
      | 'Débat'
      | 'Instances communautaires'
      | 'Lecture définitive'
      | 'Lecture unique'
      | 'Mise en application de la loi'
      | 'Nouvelle Lecture'
      | 'Promulgation de la loi'
      | 'Travaux'
      | 'deuxième lecture'
      | 'troisième lecture'
  }
  organeRef?: string
  actesLegislatifs: ActeNested[]
}

export type ActeNested = {
  uid: string
  xsiType?:
    | 'Adoption_Europe_Type'
    | 'ConclusionEtapeCC_Type'
    | 'CreationOrganeTemporaire_Type'
    | 'DecisionMotionCensure_Type'
    | 'DecisionRecevabiliteBureau_Type'
    | 'Decision_Type'
    | 'DeclarationGouvernement_Type'
    | 'DepotAccordInternational_Type'
    | 'DepotAvisConseilEtat_Type'
    | 'DepotInitiativeNavette_Type'
    | 'DepotInitiative_Type'
    | 'DepotLettreRectificative_Type'
    | 'DepotMotionCensure_Type'
    | 'DepotMotionReferendaire_Type'
    | 'DepotRapport_Type'
    | 'DiscussionCommission_Type'
    | 'DiscussionSeancePublique_Type'
    | 'Etape_Type'
    | 'EtudeImpact_Type'
    | 'MotionProcedure_Type'
    | 'NominRapporteurs_Type'
    | 'ProcedureAccelere_Type'
    | 'Promulgation_Type'
    | 'RenvoiCMP_Type'
    | 'RenvoiPrealable_Type'
    | 'RetraitInitiative_Type'
    | 'SaisieComAvis_Type'
    | 'SaisieComFond_Type'
    | 'SaisineConseilConstit_Type'
  codeActe: string

  anneeDecision?: string
  auteurMotion?: string
  auteursRefs?: string[]

  casSaisine?: {
    libelle:
      | 'De droit (article 61 alinéa 1 de la Constitution)'
      | 'Premier Ministre'
      | "Président de l'Assemblée nationale"
      | 'Président de la République'
      | 'Président du Sénat'
      | 'Soixante députés au moins'
      | 'Soixante sénateurs au moins'
  }
  codeLoi?: string
  contributionInternaute?: { dateFermeture?: string; dateOuverture?: string }
  dateActe?: string
  decision?: { libelle: 'irrecevable' | 'Motion rejeté(e)' | 'Motion rejetée' }
  depotInitialLectureDefinitiveRef?: string
  formuleDecision?: "en application des dispositions des articles 1er et 2 de la loi organique n° 2014-1392 du 24 novembre 2014 portant application de l'article 68 de la Constitution"
  infoJo?: {
    dateJo: string
    numJo: string // number stringified
    typeJo: 'JO_LOI_DECRET'
    urlLegifrance: string
    referenceNor?: string
  }
  infoJoRect?: {
    dateJo: string
    numJo: string // number stringified
    typeJo: 'JO_LOI_DECRET'
    urlLegifrance?: string
    referenceNor?: string
  }[] // only 1 or 2 items
  infoJoce?: {
    refJoce: string
    dateJoce: string
  }
  initiateur?: Initiateur
  libelleActe: {
    libelleCourt:
      | "1er dépôt d'une initiative."
      | 'Accord international'
      | 'Adoption par les instances communautaires'
      | "Allocution du Président de l'Assemblée nationale"
      | "Avis du Conseil d'Etat"
      | 'Commission Mixte Paritaire'
      | "Commission d'enquête"
      | 'Conclusion du conseil constitutionnel'
      | "Convocation d'une CMP"
      | "Création d'une commission d'enquête"
      | "Création d'une mission d'information"
      | 'Discussion en séance publique'
      | 'Décision'
      | 'Décision de la CMP'
      | 'Décision sur une motion de censure'
      | "Dépôt d'un projet de loi"
      | "Dépôt d'une déclaration du gouvernement"
      | "Dépôt d'une initiative en navette"
      | "Dépôt d'une lettre rectificative."
      | 'Dépôt de rapport'
      | "Dépôt du rapport d'une CMP"
      | "Etude d'impact"
      | "Le gouvernement déclare l'urgence / engage la procédure accélérée"
      | 'Message du président de la république'
      | "Mission d'information"
      | 'Motion de censure'
      | 'Motion de procédure'
      | 'Motion référendaire'
      | 'Nomination de rapporteur'
      | 'Nomination de rapporteur budgétaire'
      | "Promulgation d'une loi"
      | "Rapport sur l'application des lois"
      | 'Recevabilité par le Bureau'
      | 'Renvoi en commission au fond'
      | 'Renvoi préalable'
      | 'Renvoi préalable à la CAE'
      | "Retrait d'une initiative"
      | 'Réunion de commission'
      | "Saisine d'une délégation ou d'un office"
      | 'Saisine du conseil constitutionnel'
      | "Saisine pour avis d'une commission"
      | "Travaux d'une commission saisie pour avis"
      | "Travaux d'une délégation saisie pour avis"
      | 'Travaux de la commission saisie au fond'
      | 'Travaux des commissions'
    nomCanonique:
      | "1er dépôt d'une initiative."
      | 'Accord international'
      | 'Adoption par les instances communautaires'
      | "Allocution du Président de l'Assemblée nationale"
      | "Avis du Conseil d'Etat"
      | 'Commission Mixte Paritaire'
      | "Commission d'enquête"
      | 'Conclusion du conseil constitutionnel'
      | "Convocation d'une CMP"
      | "Création d'une commission d'enquête"
      | "Création d'une mission d'information"
      | 'Discussion en séance publique'
      | 'Décision'
      | 'Décision de la CMP'
      | 'Décision sur une motion de censure'
      | "Dépôt d'un projet de loi"
      | "Dépôt d'une déclaration du gouvernement"
      | "Dépôt d'une initiative en navette"
      | "Dépôt d'une lettre rectificative."
      | 'Dépôt de rapport'
      | "Dépôt du rapport d'une CMP"
      | "Etude d'impact"
      | "Le gouvernement déclare l'urgence / engage la procédure accélérée"
      | 'Message du président de la république'
      | "Mission d'information"
      | 'Motion de censure'
      | 'Motion de procédure'
      | 'Motion référendaire'
      | 'Nomination de rapporteur'
      | 'Nomination de rapporteur budgétaire'
      | "Promulgation d'une loi"
      | "Rapport sur l'application des lois"
      | 'Recevabilité par le Bureau'
      | 'Renvoi en commission au fond'
      | 'Renvoi préalable'
      | 'Renvoi préalable à la CAE'
      | "Retrait d'une initiative"
      | 'Réunion de commission'
      | "Saisine d'une délégation ou d'un office"
      | 'Saisine du conseil constitutionnel'
      | "Saisine pour avis d'une commission"
      | "Travaux d'une commission saisie pour avis"
      | "Travaux d'une délégation saisie pour avis"
      | 'Travaux de la commission saisie au fond'
      | 'Travaux des commissions'
  }
  motif?: "En application de l'article 61§2 de la Constitution"
  numDecision?: string // number stringified
  odjRef?: string
  organeRef?: string
  provenanceRef?: string
  rapporteurs?: {
    acteurRef: string
    typeRapporteur:
      | 'rapporteur'
      | 'rapporteur général'
      | 'rapporteur pour avis'
      | 'rapporteur spécial'
    etudePlfRef?: string
  }
  referenceNor?: string
  reunionRef?: string
  statutAdoption?: {
    libelle: 'adopté'
  }
  statutConclusion?: {
    libelle:
      | 'Accord'
      | 'Conforme'
      | 'Conforme avec réserve'
      | 'Désaccord'
      | 'Motion adopté(e)'
      | 'Motion adoptée'
      | 'Non conforme'
      | 'Partiellement conforme'
      | 'TCD01,'
      | 'TCD02,'
      | 'TCD04,'
      | 'adopté'
      | 'adopté avec modifications'
      | 'adopté définitivement'
      | 'adopté sans modification'
      | "adopté, dans les conditions prévues à l'article 45, alinéa 3, de la Constitution"
      | 'adoptée'
      | 'adoptée avec modifications'
      | 'adoptée définitivement'
      | "adoptée en application de l'article 151-7 du Règlement"
      | 'adoptée sans modification'
      | "adoptée, dans les conditions prévues à l'article 45, alinéa 3, de la Constitution"
      | "considéré comme adopté par l'Assemblée nationale en application de l'article 49, alinéa 3 de la Constitution"
      | "considérée comme définitive en application de l'article 151-7 du Règlement"
      | "considérée comme définitive en application de l'article 151-9 du Règlement"
      | 'modifié'
      | 'modifié par le Sénat, considéré comme adopté par l’Assemblée nationale en application de l’article 49, alinéa 3, de la Constitution après engagement de la procédure accélérée'
      | 'modifiée'
      | 'rejet du texte par la commission préalable'
      | 'rejeté'
      | 'rejeté définitivement'
      | 'rejetée'
      | 'voté par les deux assemblées du Parlement en termes identiques'
  }
  texteAdopteRef?: string
  texteAssocieRef?: string
  texteEuropeen?: {
    typeTexteEuropeen:
      | 'Acte du Conseil'
      | 'Décision du Conseil'
      | 'Règlement de la Commission'
    titreTexteEuropeen: string
  }
  texteLoiRef?: string
  textesAssocies?: {
    typeTexte: 'BTA' | 'TAP'
    texteAssocieRef: string
  }[] // 1 or 2 items
  titreLoi?: string
  typeDeclaration?: {
    libelle: "Déclaration engageant la responsabilité du Gouvernement devant l'Assemblée nationale sur le vote d'un texte"
  }
  typeMotion?: {
    libelle: 'Question préalable' | 'Motions de renvoi en commission'
  }
  typeMotionCensure?: {
    libelle: 'Motion de censure 49-3' | 'Motion de censure 49-2'
  }
  urlConclusion?: string
  urlEcheancierLoi?: string
  urlLegifrance?: string
  voteRefs?: string[]
  actesLegislatifs?: ActeNested[]
}

type Initiateur = {
  acteurs?: {
    acteurRef: string
    mandatRef: string
  }[]
  organeRef?: string
}
