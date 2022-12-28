import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import { MyLink } from '../../components/MyLink'
import * as types from './DossierList.types'

export function Page({
  dossiers,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  return (
    <div>
      <LegislatureNavigation
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />
      <h1 className="text-2xl">Dossiers</h1>
      <ul>
        {dossiers.map(d => {
          return (
            <li key={d.uid} className="my-2 block bg-slate-200 p-2">
              <span className="text-sm text-slate-500">{d.procedure}</span>{' '}
              <MyLink href={`/dossier/${d.uid}`}>
                <span className="text-md font-serif">«{d.title}»</span>
              </MyLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
