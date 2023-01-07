import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import { Todo } from '../../components/Todo'

import { GrapheRepartitionGroupes } from '../../components/GrapheRepartitionGroupes'
import { DeputeItem } from '../../components/DeputeItem'
import { LATEST_LEGISLATURE } from '../../lib/hardcodedData'
import * as types from './DeputeList.types'
import { LegislatureNavigation } from '../../components/LegislatureNavigation'

export function Page({
  deputes,
  groupesData,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  const deputesCurrent = deputes.filter(_ => _.mandat_ongoing)
  const deputesFormer = deputes.filter(_ => !_.mandat_ongoing)
  return (
    <div>
      <LegislatureNavigation
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />

      <GrapheRepartitionGroupes {...{ groupesData }} />

      <h2 className="my-4 text-center text-2xl">
        {deputesCurrent.length} députés en cours de mandat
      </h2>

      <div className="flex flex-wrap gap-x-6">
        {deputesCurrent.map(depute => {
          return (
            <DeputeItem
              key={depute.uid}
              {...{ depute, legislature }}
              displayCirco
            />
          )
        })}
      </div>
      <div className="my-4 text-center">
        <h2 className="text-2xl">
          {deputesFormer.length} député(s) ont quitté leur mandat{' '}
        </h2>
        <p className="italic text-slate-700">
          Ils ont été nommés ministres, ou ont démissionné, etc.
        </p>
      </div>

      <div className="flex flex-wrap gap-x-6">
        {deputes
          .filter(_ => !_.mandat_ongoing)
          .map(depute => {
            return (
              <DeputeItem
                key={depute.uid}
                {...{ depute, legislature }}
                displayCirco
              />
            )
          })}
      </div>

      {/* {deputes.map(depute => {
        const deputesCols = prepare3Cols(deputes)
        return (
          <div key={letter}>
            <h2 className="my-4 text-center text-4xl">{letter}</h2>
            <div className="flex">
              {deputesCols.map((deputes, idx) => {
                return (
                  <ul key={idx} className="grow-1 w-1/3">
                    {deputes.map(depute => {
                      return (
                        <li key={depute.uid}>
                          <DeputeItem
                            {...{ depute, legislature }}
                            displayCirco
                          />
                        </li>
                      )
                    })}
                  </ul>
                )
              })}
            </div>
          </div>
        )
      })} */}
    </div>
  )
}
