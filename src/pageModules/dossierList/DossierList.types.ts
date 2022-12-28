import { Dossier as FullDossier } from '../../lib/dossier'

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
