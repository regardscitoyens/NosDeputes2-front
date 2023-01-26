import * as dossierTypes from '../../lib/types/dossier'
export type Params = { legislature?: string }
export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  dossiers: Dossier[]
}

export type Dossier = {
  uid: string
  procedure: dossierTypes.Dossier['procedureParlementaire']['libelle']
  title: string
  nbReunions: number
  status: string
}
