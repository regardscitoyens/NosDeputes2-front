import { Session } from '../../lib/querySessions'
import { PointOdjFinal } from '../../lib/transformSeanceOdj'

export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  sessionsWithSeances: SessionWithSeance[]
}

export type SessionWithSeance = Session & { seances: Seance[] }

export type Seance = {
  uid: string
  session_ref: string
  start_date: string
  ordre_du_jour: PointOdjFinal[]
}
