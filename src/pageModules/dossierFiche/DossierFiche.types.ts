import { Dossier } from '../../lib/dossier'

export type Props = {
  dossier: Dossier
  organes: Organe[]
}

export type Organe = {
  uid: string
  libelle: string
}
