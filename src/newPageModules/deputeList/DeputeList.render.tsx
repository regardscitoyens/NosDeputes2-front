import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import { Todo } from '../../components/Todo'

import { GrapheRepartitionGroupes } from '../../components/NewGrapheRepartitionGroupes'
import { NewDeputeItem } from '../../components/NewDeputeItem'
import { LATEST_LEGISLATURE } from '../../lib/hardcodedData'
import * as types from './DeputeList.types'

function prepare3Cols<A>(array: A[]) {
  const len = array.length
  const canSplitEvenly = len % 3 == 0
  const minByCol = Math.floor(len / 3)
  const nbInFirstCols = canSplitEvenly ? minByCol : minByCol + 1
  return [
    array.slice(0, nbInFirstCols),
    array.slice(nbInFirstCols, nbInFirstCols * 2),
    array.slice(nbInFirstCols * 2),
  ]
}
export function Page({ deputes, groupesData }: types.Props) {
  const deputesEnCoursMandat = deputes.filter(_ => _.mandatOngoing)
  const deputesByLetter = groupBy(deputes, _ => _.firstLetterLastName[0])
  // TODO fix le tri alphabétique et le groupement par lettre : attention aux accents
  return (
    <div>
      <h1 className="text-2xl">Tous les députés par ordre alphabétique</h1>
      <p>
        Retrouvez ici l'ensemble des {deputes.length} députés de la{' '}
        {LATEST_LEGISLATURE}ème législature (dont {deputesEnCoursMandat.length}{' '}
        en cours de mandat). Les informations relatives aux députés des
        précédentes législatures restent accessibles sur les liens suivants :
        <Todo inline>liens vers les autres législatures</Todo>
      </p>
      <GrapheRepartitionGroupes {...{ groupesData }} />
      {sortBy(Object.entries(deputesByLetter), _ => _[0]).map(
        ([letter, deputes]) => {
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
                            <NewDeputeItem {...{ depute }} displayCirco />
                          </li>
                        )
                      })}
                    </ul>
                  )
                })}
              </div>
            </div>
          )
        },
      )}
    </div>
  )
}
