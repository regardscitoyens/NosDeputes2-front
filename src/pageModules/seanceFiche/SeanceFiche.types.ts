import { PointOdjFinal } from '../../lib/transformSeanceOdj'
import { CompteRendu } from '../../lib/types/compterendu'

export type Props = {
  seance: Seance
  compteRendu: CompteRendu
}
export type Seance = {
  uid: string
  session_ref: string
  start_date: string
  ordre_du_jour: PointOdjFinal[] | null
}
