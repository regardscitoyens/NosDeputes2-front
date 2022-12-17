import { Session } from '../../lib/querySessions'

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
}
