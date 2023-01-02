// Very complicated object
// Types written manually. Some fields I left unknown
// See also : https://data.tricoteuses.fr/doc/assemblee/actes/schemas.html#actelegislatif.json

import * as acteTypes from './acte'

export type Dossier = {
  actesLegislatifs?: acteTypes.ActeLegislatif[]
  fusionDossier?: {
    cause: 'Dossier absorbé' | 'Examen commun'
    dossierAbsorbantRef: string
  }
  indexation: unknown // https://data.tricoteuses.fr/doc/assemblee/document.html#indexation.json
  initiateur?: {
    acteurs?: { acteurRef: string; mandatRef: string }[]
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
