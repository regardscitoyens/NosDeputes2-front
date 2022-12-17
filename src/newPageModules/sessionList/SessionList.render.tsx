import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import * as types from './SessionList.types'
import { formatDate } from '../../lib/utils'

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
          return (
            <li key={s.uid}>
              {formatDate(s.start_date)} au {formatDate(s.end_date)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
