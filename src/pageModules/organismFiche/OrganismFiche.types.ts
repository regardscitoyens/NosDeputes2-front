import { FonctionInGroupe, FonctionInOrganisme } from '../../lib/hardcodedData'

export type Props = {
  organisme: Organism
}
export type Organism = {
  id: number
  nom: string
  deputes: Depute[]
}
export type Depute = {
  id: number
  slug: string
  nom: string
  nom_de_famille: string
  nom_circo: string
  mandatOngoing: boolean
  latestGroup: {
    acronym: string
    fonction: FonctionInGroupe
  } | null
  fonction: FonctionInOrganisme
  currentMember: boolean
}
