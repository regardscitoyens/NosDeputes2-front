import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import { Fragment } from 'react'
import { DeputeItem } from '../../components/DeputeItem'
import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import * as types from './ComPermList.types'

export function ChunkOfDeputes({
  deputes,
  legislature,
}: {
  deputes: (types.DeputeWithCom | types.DeputeWithoutCom)[]
  legislature: number
}) {
  if (deputes.length === 0) return null

  const deputesSorted = sortBy(deputes, _ => {
    const fonction = _.latestComPerm !== null && _.latestComPerm.fonction
    const score =
      fonction === 'Président'
        ? 1
        : fonction === 'Vice-Président'
        ? 2
        : fonction === 'Rapporteur général'
        ? 3
        : fonction === 'Secrétaire'
        ? 4
        : fonction === 'Membre'
        ? 5
        : 10
    return `${score}_${_.latestGroup?.acronym}`
  })

  return (
    <>
      <div className="my-4 flex flex-wrap gap-2">
        {deputesSorted.map(depute => {
          return (
            <DeputeItem
              key={depute.uid}
              depute={{ ...depute, mandat_ongoing: true }}
              {...{ legislature }}
              className="grow"
            />
          )
        })}
      </div>
    </>
  )
}

export function Page({
  deputesWithCom,
  deputesWithoutCom,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  const deputesWithComGroupedByCom = Object.values(
    groupBy(deputesWithCom, _ => _.latestComPerm.name_short),
  )

  return (
    <div>
      <LegislatureNavigation
        title="Commissions permanentes"
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />

      <p>Petit texte d'explication des commissions permanentes</p>
      {deputesWithComGroupedByCom.map(deputesSameCom => {
        const com = deputesSameCom[0].latestComPerm
        return (
          <Fragment key={com?.name_short ?? 'none'}>
            <h2 className="m-2 text-4xl font-extrabold">{com.name_long}</h2>
            <ChunkOfDeputes deputes={deputesSameCom} {...{ legislature }} />
          </Fragment>
        )
      })}
      <h2 className="m-2 text-4xl font-extrabold">
        Députés sans commissions (??)
      </h2>
      <ChunkOfDeputes deputes={deputesWithoutCom} {...{ legislature }} />
    </div>
  )
}
