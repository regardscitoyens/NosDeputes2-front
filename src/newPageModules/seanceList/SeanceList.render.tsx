import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import * as types from './SeanceList.types'
import {
  formatDate,
  formatDateWithTimeAndWeekday,
  getWeek,
  getWeekYear,
} from '../../lib/utils'
import groupBy from 'lodash/groupBy'

export function Page({
  sessionsWithSeances,
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
        {sessionsWithSeances.map(session => {
          const { uid, kind, start_date, end_date, seances } = session

          const seancesByWeek = groupBy(seances, _ => {
            const d = new Date(_.start_date)
            return `${getWeekYear(d)} ${getWeek(d)}`
          })

          return (
            <li key={uid} className="py-2">
              <h2 className="text-xl">
                Session {kind} du {formatDate(start_date)} au{' '}
                {formatDate(end_date)}
              </h2>
              <ul className="pl-8">
                {Object.entries(seancesByWeek).map(([week, seancesOfWeek]) => {
                  return (
                    <li key={week} className="py-2">
                      <ul>
                        {seancesOfWeek.map(seance => {
                          const { uid, start_date } = seance
                          return (
                            <li key={uid}>
                              Séance du{' '}
                              {formatDateWithTimeAndWeekday(start_date)}
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
