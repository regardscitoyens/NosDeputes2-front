import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import * as types from './SessionList.types'
import { formatDate } from '../../lib/utils'
import { Session } from '../../lib/querySessions'

export function Page({
  sessions,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  return (
    <div>
      <LegislatureNavigation
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />
      <h1 className="text-2xl">Sessions</h1>
      <ul>
        {sessions.map(s => {
          const nbDays = computeNbDays(s)
          return (
            <li key={s.uid}>
              Session {s.kind} {formatDate(s.start_date)} au{' '}
              {formatDate(s.end_date)} - {nbDays} jour{nbDays > 1 ? 's' : ''}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function computeNbDays(session: Session) {
  const diffInMs =
    new Date(session.end_date).getTime() -
    new Date(session.start_date).getTime()
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  return Math.max(1, diffInDays)
}
