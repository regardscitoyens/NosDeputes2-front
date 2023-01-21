import { Fragment } from 'react'
import { DeputeItem } from '../../components/DeputeItem'
import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import {
  dateDiffInDays,
  formatDate,
  formatDateWithoutWeekday,
} from '../../lib/utils'
import * as types from './MandatsParCirco.types'

export function CauseChangement({ cause }: { cause: types.CauseChangement }) {
  function buildLabel(): string | null {
    switch (cause.kind) {
      case 'elections_generales':
        return null
      case 'remplacement': {
        switch (cause.details) {
          case 'decede':
            return 'Il(elle) est remplacé(e) suite à son décès'
          case 'demission_incompatibilite_mandats':
            return `Il(elle) est remplacé(e) suite à sa démission pour incompatibilité avec un autre mandat`
          case 'mission_longue':
            return `Il(elle) est remplacé(e) car il(elle) est nommé à une mission temporaire» de plus de 6 mois`
          case 'nomme_cc':
            return `Il(elle) est remplacé(e) car nommé(e) au Conseil Constitutionnel`
          case 'nomme_gvt':
            return `Il(elle) est remplacé(e) car nommé(e) au gouvernement`
        }
      }
      case 'elections_partielles':
        return 'todo'
      case 'retour':
        return 'todo'
    }
    return null
  }

  return <p className="text-center italic text-slate-500">{buildLabel()}</p>
}

export function Page({
  legislature,
  legislatureNavigationUrls,
  dataByCirco,
}: types.Props) {
  return (
    <div className="">
      <LegislatureNavigation
        title="Changements de député"
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />
      <p className="m-4 text-slate-800">
        Cette page recense tous les changements de députés en cours de
        législature : députés partis au gouvernement, démissions, élections
        partielles etc.
      </p>

      {dataByCirco.map(circoData => {
        const {
          circo: {
            name_dpt,
            num_dpt,
            num_circo,
            region,
            region_type,
            ref_circo,
          },
          mandats,
        } = circoData

        return (
          <div className="my-4 p-2" key={ref_circo}>
            <p className="mb-2 text-center ">
              <span className="text-4xl font-extrabold">
                {name_dpt}
                {name_dpt !== 'Français établis hors de France' && (
                  <span className="text-2xl"> ({num_dpt})</span>
                )}{' '}
              </span>
              <span className="text-2xl">
                {'>'}{' '}
                <span className="font-bold">
                  {num_circo}ème circonscription
                </span>
              </span>
            </p>
            <div className="flex flex-col items-center gap-6">
              {mandats.map((mandatsSameElection, idx) => {
                const isPartialElections = idx !== 0
                return (
                  <div
                    key={idx}
                    className={` w-fit rounded-xl bg-slate-200 py-2 px-4 shadow-lg `}
                  >
                    {isPartialElections && (
                      <p className="mb-4 text-center text-lg">
                        <span className="font-bold">Une nouvelle élection</span>{' '}
                        a eu lieu dans cette circonscription{' '}
                        <span className="italic text-slate-500">
                          («élection partielle»)
                        </span>
                      </p>
                    )}
                    {mandatsSameElection.map((mandat, idxInElection) => {
                      const {
                        depute,
                        date_debut_mandat,
                        date_fin_mandat,
                        cause_fin,
                        is_suppleant,
                      } = mandat
                      const elected = idxInElection === 0
                      const f = formatDateWithoutWeekday
                      const nbDays = dateDiffInDays(
                        date_debut_mandat,
                        date_fin_mandat ?? new Date().toISOString(),
                      )
                      const zeroDays = nbDays == 0
                      return (
                        <Fragment key={date_debut_mandat}>
                          <div className="my-2 flex flex-wrap gap-2">
                            <DeputeItem
                              depute={depute}
                              legislature={legislature}
                              className={'border border-slate-400'}
                            />
                            <div className="flex items-center">
                              <span>
                                {is_suppleant ? (
                                  <span className="">(son suppléant) </span>
                                ) : null}
                                {zeroDays ? (
                                  <>
                                    est techniquement député(e) pendant quelques
                                    heures le {f(date_debut_mandat)}
                                  </>
                                ) : (
                                  <>
                                    {elected ? 'est élu(e)' : 'est devenu(e)'}{' '}
                                    député(e){' '}
                                    {date_fin_mandat ? 'du' : 'depuis le'}{' '}
                                    <span className="font-bold">
                                      {f(date_debut_mandat)}
                                    </span>
                                    {date_fin_mandat && (
                                      <> au {f(date_fin_mandat)}</>
                                    )}{' '}
                                    {nbDays < 50 ? (
                                      <>(pendant seulement {nbDays} jours)</>
                                    ) : null}
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                          {cause_fin && <CauseChangement cause={cause_fin} />}
                        </Fragment>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
