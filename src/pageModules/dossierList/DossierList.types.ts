import * as dossierTypes from '../../lib/types/dossier'

export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  dossiers: Dossier[]
}

export type Dossier = {
  uid: string
  procedure: dossierTypes.Dossier['procedureParlementaire']['libelle']
  title: string
  nbActes: number
}
