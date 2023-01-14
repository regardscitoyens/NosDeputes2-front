import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import * as types from './SessionList.types'
import { formatDate } from '../../lib/utils'
import * as sessionTypes from '../../lib/types/session'

export function Page({
  sessions,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  return (
    <div>
      <LegislatureNavigation
        title="Sessions parlementaires"
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />
      <p className="m-8 text-center text-red-600">
        cette page est juste un brouillon, pas sûr de ce qu'elle va devenir
      </p>
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

function computeNbDays(session: sessionTypes.Session) {
  const diffInMs =
    new Date(session.end_date).getTime() -
    new Date(session.start_date).getTime()
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  return Math.max(1, diffInDays)
}
