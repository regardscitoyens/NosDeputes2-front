import { Fragment } from 'react'
import { DeputeItem } from '../../components/DeputeItem'
import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import {
  dateDiffInDays,
  formatDateWithoutWeekday,
  lastOfArray,
} from '../../lib/utils'
import * as types from './MandatsParCirco.types'

export function CauseChangement({
  cause,
  fem,
}: {
  cause: types.CauseChangement
  fem: boolean
}) {
  const femE = fem ? 'e' : ''
  const ilElle = fem ? 'Elle' : 'Il'
  function buildLabel(): string | null {
    const errMsg = `Unknown cause ${JSON.stringify(cause)}`
    switch (cause.kind) {
      case 'elections_generales':
        return null
      case 'remplacement': {
        switch (cause.details) {
          case 'decede':
            return `${ilElle} est remplacé${femE} suite à son décès`
          case 'demission_incompatibilite_mandats':
            return `${ilElle} est remplacé${femE} suite à sa démission pour incompatibilité avec un autre mandat`
          case 'mission_longue':
            return `${ilElle} est remplacé${femE} car ${ilElle} est nommé${femE} à une mission temporaire» de plus de 6 mois`
          case 'nomme_cc':
            return `${ilElle} est remplacé${femE} car nommé${femE} au Conseil Constitutionnel`
          case 'nomme_gvt':
            return `${ilElle} est remplacé${femE} car nommé${femE} au gouvernement`
          default:
            throw new Error(errMsg)
        }
      }
      case 'elections_partielles': {
        switch (cause.details) {
          case 'annulation_election':
            return `L'élection a été annulée par le Conseil Constitutionnel`
          case 'dechu':
            return `${ilElle} a été déchu${femE} de son mandat` // TODO what ?
          case 'demission':
            return `${ilElle} a démissionné`
          case 'demission_incompatibilite':
            return `${ilElle} a démissioné pour incompatibilité avec un autre mandat`
          case 'elu_parlement_europeen':
            return `${ilElle} est remplacé${femE} car élu${femE} au parlement européen`
          case 'elu_senat':
            return `${ilElle} est remplacé${femE} car élu${femE} au Sénat`
          case 'decede_sans_suppleant':
            return `${ilElle} est décédé${femE} sans suppléant`
          case undefined:
            return null
        }
      }
      case 'retour': {
        switch (cause.details) {
          case 'retour_gvt':
            return `${ilElle} est remplacé${femE} par son précédesseur qui est revenu du gouvernement`
          default:
            throw new Error(errMsg)
        }
      }
      default:
        throw new Error(errMsg)
    }
  }

  return <p className="text-left italic text-slate-500">{buildLabel()}</p>
}

function PartialElection({
  cause,
}: {
  cause: types.CauseChangement | undefined
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="mb-4 mt-2 max-w-lg p-4 text-center">
        <p className="text-lg">
          <span className="font-bold">Une nouvelle élection</span> a eu lieu
          dans cette circonscription{' '}
          <span className="italic text-slate-500">
            C'est ce qu'on appelle une «élection partielle».
          </span>
        </p>
        {/* <p className="italic text-slate-500">{getLabel()}</p> */}
      </div>
    </div>
  )
}

export function Page({
  legislature,
  legislatureNavigationUrls,
  dataByCirco,
}: types.Props) {
  console.log('@@', dataByCirco)
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
          <div className="items-left my-4 flex flex-col p-2" key={ref_circo}>
            <p className="mb-2  ">
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
            <div className="flex w-fit flex-col items-center justify-center gap-6">
              {mandats.map((mandatsSameElection, idx) => {
                const isPartialElections = idx !== 0
                return (
                  <div
                    key={idx}
                    className={`w-full rounded-xl bg-slate-200 py-2 px-4 shadow-lg `}
                  >
                    {isPartialElections && (
                      <PartialElection
                        cause={lastOfArray(mandats[idx - 1]).cause_fin}
                      />
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
                      const fem = depute.gender === 'F'
                      const femE = fem ? 'e' : ''
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
                                  <span className="">
                                    ({fem ? 'sa suppléante' : 'son suppléant'}){' '}
                                  </span>
                                ) : null}
                                {zeroDays ? (
                                  <>
                                    est techniquement député{femE} pendant
                                    quelques heures le {f(date_debut_mandat)}
                                  </>
                                ) : (
                                  <>
                                    {elected
                                      ? `est élu${femE}`
                                      : `est devenu${femE}`}{' '}
                                    député{femE}{' '}
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
                          {cause_fin && (
                            <CauseChangement cause={cause_fin} {...{ fem }} />
                          )}
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
