import * as seanceTypes from '../../lib/types/seance'
import * as compteRenduTypes from '../../lib/types/compteRendu'
export type Params = {
  uid: string
}
export type Props = {
  seance: Seance
  compteRendu: compteRenduTypes.CompteRendu
}
export type Seance = {
  uid: string
  session_ref: string
  start_date: string
  ordre_du_jour: seanceTypes.PointOdjFinal[] | null
}
