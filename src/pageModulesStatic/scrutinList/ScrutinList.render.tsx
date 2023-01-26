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
  // console.log('@@@ ', scrutins)
  const scrutinsBySeanceRef = groupBy(scrutins, _ => _.seance_ref)
  return (
    <div>
      <LegislatureNavigation
        title="Les scrutins"
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />

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
      {s.mode_publication_des_votes !== 'DecompteNominatif' && (
        <>
          {' '}
          <span className="text-sm text-teal-600">
            Mode de publication "{s.mode_publication_des_votes}"
          </span>
        </>
      )}
      <div>
        {s.synthese_vote.decompte.pour} votes pour sur{' '}
        {s.synthese_vote.suffragesExprimes} votes (majorité requise{' '}
        {s.synthese_vote.nbrSuffragesRequis})
      </div>
      <div
        style={{ width: s.synthese_vote.suffragesExprimes + 'px' }}
        className="h-2 bg-slate-600"
      >
        <div
          style={{ width: s.synthese_vote.decompte.pour + 'px' }}
          className="h-full bg-green-600"
        ></div>
      </div>
    </div>
  )
}
