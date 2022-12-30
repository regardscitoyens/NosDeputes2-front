import { Dossier as FullDossier } from '../../lib/types/dossier'

export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  dossiers: Dossier[]
}

export type Dossier = {
  uid: string
  procedure: FullDossier['procedureParlementaire']['libelle']
  title: string
}
