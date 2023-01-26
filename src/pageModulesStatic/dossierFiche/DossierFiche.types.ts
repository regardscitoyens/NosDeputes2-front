import { WithLatestGroupOrNull } from '../../lib/addLatestGroup'
import * as dossierTypes from '../../lib/types/dossier'
export type Params = {
  id: string
}
export type Props = {
  dossier: dossierTypes.Dossier
  organes: Organe[]
  acteurs: Acteur[]
}

export type Organe = {
  uid: string
  libelle: string
  code_type: OrganeCodeType
}

export type Acteur = WithLatestGroupOrNull<{
  uid: string
  full_name: string
}>

export type OrganeCodeType =
  | 'GA'
  | 'CMP'
  | 'DELEGSENAT'
  | 'PARPOL'
  | 'CONFPT'
  | 'CONSTITU'
  | 'MISINFOPRE'
  | 'MISINFOCOM'
  | 'CJR'
  | 'GE'
  | 'COMSENAT'
  | 'MINISTERE'
  | 'CNPE'
  | 'HCJ'
  | 'ASSEMBLEE'
  | 'DELEGBUREAU'
  | 'PRESREP'
  | 'GOUVERNEMENT'
  | 'API'
  | 'COMPER'
  | 'GEVI'
  | 'DELEG'
  | 'CNPS'
  | 'MISINFO'
  | 'SENAT'
  | 'COMNL'
  | 'GP'
  | 'GROUPESENAT'
  | 'ORGEXTPARL'
  | 'COMSPSENAT'
  | 'OFFPAR'
  | 'CIRCONSCRIPTION'
