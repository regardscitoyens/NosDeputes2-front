import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import * as types from './ReunionList.types'

export function Page({
  reunions,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  console.log('reunions', reunions)
  return (
    <div>
      <LegislatureNavigation
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />
      <div className="bg-orange-400">
        Cette page est une exploration du dataset "Agenda" de l'open data. Pas
        sûr de ce que ça devenir
      </div>
      <h1 className="text-2xl">Reunions</h1>
      <ul>
        {reunions.map(reunion => {
          return (
            <li key={reunion.uid}>
              {reunion.uid} {reunion.xsi_type}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
