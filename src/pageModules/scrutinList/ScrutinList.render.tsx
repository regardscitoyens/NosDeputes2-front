import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import * as types from './ScrutinList.types'
import {
  capitalizeFirstLetter,
  formatDate,
  formatDateWithTimeAndWeekday,
} from '../../lib/utils'
import groupBy from 'lodash/groupBy'

export function Page({
  scrutins,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  console.log('@@@ ', scrutins)
  const scrutinsBySeanceRef = groupBy(scrutins, _ => _.seance_ref)
  return (
    <div>
      <LegislatureNavigation
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />
      <h1 className="my-4 text-2xl">Scrutins</h1>

      {Object.entries(scrutinsBySeanceRef).map(([seance_ref, scrutins]) => {
        return (
          <div key={seance_ref} className="my-8 bg-slate-200 p-2">
            <h2 className="mb-2 font-bold">Séance {seance_ref}</h2>
            <div className="space-y-4 ">
              {scrutins.map(scrutin => {
                return <Scrutin key={scrutin.uid} {...{ scrutin }} />
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Scrutin({ scrutin }: { scrutin: types.Scrutin }) {
  const s = scrutin
  return (
    <div className=" px-2 ">
      <span className="">{formatDate(s.date_scrutin)}</span>{' '}
      <span className={' px-1 text-sm italic '}>
        {s.type_vote.libelleTypeVote}
      </span>{' '}
      <span
        className={
          'ml-1 font-bold uppercase ' +
          (s.sort === 'adopté'
            ? '  bg-green-700 px-1 text-slate-200'
            : ' text-yellow-600')
        }
      >
        {s.sort}
      </span>{' '}
      <span className="text-slate-500">{capitalizeFirstLetter(s.title)}</span>{' '}
      <span className="text-sm text-slate-400">
        ID scrutin {s.uid}, numéro {s.numero} de cette législature
      </span>
      {s.demandeur_texte && (
        <>
          {' '}
          <span className="mt-2  text-sm italic text-slate-400">
            Demandé par <span className={''}>{s.demandeur_texte}</span>
          </span>
        </>
      )}
    </div>
  )
}
