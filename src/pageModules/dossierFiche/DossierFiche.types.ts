import { Dossier } from '../../lib/types/dossier'

export type Props = {
  dossier: Dossier
  organes: Organe[]
  acteurs: Acteur[]
}

export type Organe = {
  uid: string
  libelle: string
}

export type Acteur = {
  uid: string
  full_name: string
}
