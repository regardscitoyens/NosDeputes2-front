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
              {formatDate(s.start_date)} au {formatDate(s.end_date)} {s.kind}
              <div
                className="ml-2 inline-block bg-green-800 p-2"
                style={{
                  width: computeWidth(s),
                }}
              >
                {' '}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function computeWidth(s: types.Session) {
  const diff = new Date(s.end_date).getTime() - new Date(s.start_date).getTime()
  const diffInDays = Math.round(diff / (1000 * 60 * 60 * 24))

  console.log('@@@ diff', diffInDays)
  const maxInDays = 365
  const ratio = Math.max(Math.min(diffInDays, maxInDays), 0) / maxInDays
  const percent = Math.max(ratio * 100, 1)
  console.log('@@@ diff', diffInDays, ratio, percent)

  return `${percent}%`
}
