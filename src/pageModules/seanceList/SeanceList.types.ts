import * as sessionTypes from '../../lib/types/session'
import * as seanceTypes from '../../lib/types/seance'
export type Params = { legislature?: string }
export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  sessionsWithSeances: SessionWithSeance[]
}

export type SessionWithSeance = sessionTypes.Session & { seances: Seance[] }

export type Seance = {
  uid: string
  session_ref: string
  start_date: string
  ordre_du_jour: seanceTypes.PointOdjFinal[]
}
