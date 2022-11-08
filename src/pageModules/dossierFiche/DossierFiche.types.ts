export type Props = {
  section: LocalSection
  subSections: LocalSubSectionWithSeance[]
  seances: LocalSeance[]
  speakingDeputes: LocalDepute[]
  textesLoi: LocalTexteLoi[]
  // Parfois on trouve des ids de loi mais pas le texteloi correspondant
  // Exemple https://www.nosdeputes.fr/16/dossier/134
  // il y a "Texte N° 17" / "Texte N° 146" / "Texte N° 180"
  othersLoiWithoutTexte: number[]
}

export type LocalSection = {
  id: number
  section_id: number
  titre_complet: string
  id_dossier_an: string | null
}
export type LocalSubSection = {
  id: number
  titre: string | null
  titre_complet: string
}
export type LocalSubSectionWithSeance = LocalSubSection & {
  seance_id: number | null
}
export type LocalSeanceWithRawDate = {
  id: number
  date: Date
  moment: string
  type: 'hemicycle' | 'commission'
}
export type LocalSeance = {
  id: number
  date: string
  moment: string
  type: 'hemicycle' | 'commission'
}
export type LocalTexteLoi = {
  id: string
  numero: number
  type:
    | `Proposition de loi`
    | `Projet de loi`
    | `Proposition de résolution`
    | `Rapport`
    | `Rapport d'information`
    | `Avis`
  type_details: string | null
  titre: string
  signataires: string
}
export type LocalDepute = {
  id: number
  nom: string
  slug: string
}
