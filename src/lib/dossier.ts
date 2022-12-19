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
  initiateur?: {
    acteurs?: {
      acteurRef: string
      mandatRef: string
    }[]
    organeRef?: string
  }
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
    senatChemin: string
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

type ActeRacine = {
  uid: string
  xsiType: 'Etape_Type'
  codeActe:
    | 'AN-APPLI'
    | 'AN1'
    | 'AN2'
    | 'AN20'
    | 'AN21'
    | 'AN3'
    | 'ANLDEF'
    | 'ANLUNI'
    | 'ANNLEC'
    | 'CC'
    | 'CMP'
    | 'EU'
    | 'PROM'
    | 'SN1'
    | 'SN2'
    | 'SN3'
    | 'SNNLEC'
  libelleActe: {
    libelleCourt?:
      | '1ère lecture'
      | '2ème lecture'
      | '3ème lecture'
      | 'Commission Mixte Paritaire'
      | 'Conseil constitutionnel'
      | 'Débat'
      | 'Instances communautaires'
      | 'Lecture définitive'
      | 'Mise en application de la loi'
      | 'Nouvelle lecture'
      | 'Promulgation de la loi'
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
  actesLegislatifs: unknown
}

type ActeNested = {
  uid: unknown
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
  codeActe: unknown

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
  infoJoRect?: unknown
  infoJoce?: unknown
  initiateur?: unknown
  libelleActe: unknown
  motif?: unknown
  numDecision?: unknown
  odjRef?: unknown
  organeRef?: unknown
  provenanceRef?: unknown
  rapporteurs?: unknown
  referenceNor?: unknown
  reunionRef?: unknown
  statutAdoption?: unknown
  statutConclusion?: unknown
  texteAdopteRef?: unknown
  texteAssocieRef?: unknown
  texteEuropeen?: unknown
  texteLoiRef?: unknown
  textesAssocies?: unknown
  titreLoi?: unknown
  typeDeclaration?: unknown
  typeMotion?: unknown
  typeMotionCensure?: unknown
  urlConclusion?: unknown
  urlEcheancierLoi?: unknown
  urlLegifrance?: unknown
  voteRefs?: unknown
  actesLegislatifs?: ActeNested[]
}
