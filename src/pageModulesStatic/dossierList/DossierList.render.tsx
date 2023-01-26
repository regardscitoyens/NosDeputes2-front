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
        title="Dossiers législatifs"
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />
      <ul>
        {dossiers.map(d => {
          return (
            <li
              key={d.uid}
              className="my-2 flex justify-between bg-slate-200 p-2"
            >
              <div className="">
                <span className="text-sm text-slate-500">{d.procedure}</span>{' '}
                <MyLink href={`/dossier/${d.uid}`}>
                  <span className="text-md font-serif">«{d.title}»</span>
                </MyLink>{' '}
              </div>
              <p className=" px-2 text-sm font-bold">{d.status}</p>
              <p className=" text-sm text-slate-500">{d.nbReunions} réunions</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
