import { FonctionInGroupe } from '../../lib/hardcodedData'

export type Props = {
  groupeInfo: {
    nom: string
    acronym: string
  }
  deputes: {
    current: Depute[]
    former: Depute[]
  }
}
export type Depute = {
  id: number
  nom: string
  nom_de_famille: string
  nom_circo: string
  slug: string
  mandatOngoing: boolean
  latestGroup: {
    id: number
    acronym: string
    fonction: FonctionInGroupe
    nom: string
    slug: string
  }
}
