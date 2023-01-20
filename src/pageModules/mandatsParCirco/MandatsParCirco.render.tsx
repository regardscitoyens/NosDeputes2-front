import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import { formatDate } from '../../lib/utils'
import * as types from './MandatsParCirco.types'

export function Page({
  legislature,
  legislatureNavigationUrls,
  dataByCirco,
}: types.Props) {
  return (
    <div>
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
          <div
            className="my-4 rounded-xl bg-slate-200 p-2 shadow-lg"
            key={ref_circo}
          >
            <p className="font-bold">
              {region} {'>'} {name_dpt} {'>'} {num_circo}
            </p>
            {mandats.map((mandatsSameElection, idx) => {
              return (
                <>
                  {idx !== 0 && (
                    <p className=" font-bold text-green-800">
                      Elections partielles
                    </p>
                  )}
                  {mandatsSameElection.map(mandat => {
                    const {
                      acteur_uid,
                      date_debut_mandat,
                      date_fin_mandat,
                      full_name,
                      suppleant_ref,
                      cause_fin,
                      cause_debut,
                    } = mandat
                    return (
                      <div
                        key={date_debut_mandat}
                        className="m-4 rounded bg-slate-100 p-2 shadow-lg"
                      >
                        {full_name} {acteur_uid} {formatDate(date_debut_mandat)}
                        {' => '}
                        {date_fin_mandat && formatDate(date_fin_mandat)}{' '}
                        {suppleant_ref}{' '}
                        {cause_fin && (
                          <span className="text-sm italic text-slate-500">
                            {cause_fin.kind}{' '}
                            {cause_fin.kind !== 'elections_generales' &&
                              cause_fin.details}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
