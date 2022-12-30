import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import * as types from './ScrutinList.types'
import { capitalizeFirstLetter } from '../../lib/utils'

export function Page({
  scrutins,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  console.log('@@@ ', scrutins)
  return (
    <div>
      <LegislatureNavigation
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />
      <h1 className="my-4 text-2xl">Scrutins</h1>
      <ul className="space-y-2">
        {scrutins.map(s => {
          console.log(s.sort, s.sort === 'adopté')
          return (
            <li key={s.uid} className="bg-slate-200 px-2">
              <div>
                <span className="text-sm text-slate-400">{s.uid}</span>{' '}
                <span
                  className={
                    ' px-1 font-bold uppercase ' +
                    (s.sort === 'adopté'
                      ? ' bg-green-700 text-slate-200'
                      : ' text-yellow-600')
                  }
                >
                  {s.sort}
                </span>{' '}
                <span className={' px-1 text-sm font-bold uppercase '}>
                  {s.type_vote.libelleTypeVote}
                </span>{' '}
                <span className="text-slate-500">
                  {capitalizeFirstLetter(s.title)}
                </span>
              </div>
              <div className="mt-2 text-right text-sm italic text-slate-400">
                Demandé par <span className={''}>{s.demandeur_texte}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
