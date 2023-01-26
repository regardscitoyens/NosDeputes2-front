import groupBy from 'lodash/groupBy'
import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import { MyLink } from '../../components/MyLink'
import * as seanceTypes from '../../lib/types/seance'
import {
  formatDate,
  formatDateWithTimeAndWeekday,
  getWeek,
  getWeekYear,
} from '../../lib/utils'
import * as types from './SeanceList.types'

export function Page({
  sessionsWithSeances,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  return (
    <div className="mt-4">
      <LegislatureNavigation
        title="Séances en hémicycle"
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />
      <ul>
        {sessionsWithSeances.map(session => {
          const { uid, kind, start_date, end_date, seances } = session

          const seancesByWeek = groupBy(seances, _ => {
            const d = new Date(_.start_date)
            return `${getWeek(d)} de ${getWeekYear(d)}`
          })

          return (
            <li key={uid} className="py-2">
              <h2 className="my-2 text-xl">
                Session {kind} du {formatDate(start_date)} au{' '}
                {formatDate(end_date)}
              </h2>
              <ul className="space-y-8 pl-8">
                {Object.entries(seancesByWeek).map(([week, seancesOfWeek]) => {
                  return (
                    <li key={week} className="bg-slate-200 p-2 shadow-lg ">
                      <h3 className="font-bold">Semaine {week} </h3>
                      <ul>
                        {seancesOfWeek.map(seance => {
                          const { uid, start_date } = seance
                          const isFuture = new Date(start_date) > new Date()
                          const seanceTitle = `Séance ${
                            isFuture ? 'prévue le' : 'du'
                          } ${formatDateWithTimeAndWeekday(start_date)}`
                          return (
                            <li key={uid} id={uid}>
                              {!isFuture ? (
                                <MyLink href={`/seance/${uid}`} className="">
                                  {seanceTitle}
                                </MyLink>
                              ) : (
                                seanceTitle
                              )}
                              <ul className="ml-8  text-slate-500">
                                {seance.ordre_du_jour.map(point => {
                                  return (
                                    <li key={point.uid} className="">
                                      <PointOrdreDuJour {...{ point }} />
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
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PointOrdreDuJour({ point }: { point: seanceTypes.PointOdjFinal }) {
  const kind =
    point.typePointOdj === 'Suite de la discussion'
      ? 'Discussion (suite)'
      : point.typePointOdj

  function simplifyObjet(s: string) {
    switch (kind) {
      case 'Discussion':
        return withoutPrefixes(s, 'Discussion du', 'Discussion de la')
      case 'Discussion (suite)':
        return withoutPrefixes(
          s,
          'Suite de la discussion du',
          'Suite de la discussion de la',
        )
      case 'Questions au Gouvernement':
        return s === 'Questions au Gouvernement' ? '' : s
    }
    return s
  }

  const objet = capitalizeFirstLetter(simplifyObjet(point.objet).trim())

  const { dossierLegislatifRef } = point
  return (
    <span>
      <span className="mr-1 bg-green-100 px-1">{kind}</span>
      <span className="italic">{objet}</span>{' '}
      <DossierLegislatifRef {...{ dossierLegislatifRef }} />
    </span>
  )
}

function DossierLegislatifRef({
  dossierLegislatifRef,
}: {
  dossierLegislatifRef?: string
}) {
  if (dossierLegislatifRef) {
    return (
      <span>
        <MyLink href={`/dossier/${dossierLegislatifRef}`} className="text-sm">
          voir le dossier
        </MyLink>
      </span>
    )
  }
  return null
}

function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function withoutPrefixes(s: string, ...prefixes: string[]): string {
  let res = s
  prefixes.forEach(p => {
    res = withoutPrefix(res, p)
  })
  return res
}

function withoutPrefix(s: string, prefix: string): string {
  if (s.startsWith(prefix)) return s.slice(prefix.length)
  return s
}
