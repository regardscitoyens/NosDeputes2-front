import { Session } from '../../lib/querySessions'

export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  sessions: Session[]
}
