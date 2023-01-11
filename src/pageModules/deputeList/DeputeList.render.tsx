import { DeputeItem } from '../../components/DeputeItem'
import { GrapheRepartitionGroupes } from '../../components/GrapheRepartitionGroupes'
import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import * as types from './DeputeList.types'
import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import { PositionPolitique } from '../../lib/newAddLatestGroup'

function divideByGroup(deputes: types.Depute[]): types.Depute[][] {
  return sortBy(
    Object.values(groupBy(deputes, _ => _.latestGroup?.acronym)),
    _ => -_.length,
  )
}

export function SubsetOfDeputes({
  title,
  deputes,
  legislature,
}: {
  title?: string
  deputes: types.Depute[]
  legislature: number
}) {
  if (deputes.length === 0) return null
  return (
    <>
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      <div className="my-4 flex flex-wrap gap-2">
        {deputes.map(depute => {
          return (
            <DeputeItem
              key={depute.uid}
              {...{ depute, legislature }}
              displayCirco
            />
          )
        })}
      </div>
    </>
  )
}

function DeputesOfSamePositionPolitique({
  deputes,
  position_politique,
  legislature,
}: {
  deputes: types.Depute[]
  position_politique: PositionPolitique
  legislature: number
}) {
  const deputesFiltered = deputes.filter(
    _ => _.latestGroup?.position_politique === position_politique,
  )
  const deputesByGroup = divideByGroup(deputesFiltered)
  const plural = deputesByGroup.length > 1
  const positionPolitiqueLabel =
    position_politique === 'Opposition'
      ? `d'opposition`
      : `${position_politique.toLowerCase()}${plural ? 's' : ''}`
  const label = `Groupe${plural ? 's' : ''} ${positionPolitiqueLabel}`
  return (
    <>
      <h2 className="text-center text-4xl font-extrabold">{label}</h2>
      {deputesByGroup.map(deputesOfOneGroupe => {
        const acronym = deputesOfOneGroupe[0].latestGroup?.acronym ?? ''
        return (
          <SubsetOfDeputes
            key={acronym}
            deputes={deputesOfOneGroupe}
            {...{ legislature }}
          />
        )
      })}
    </>
  )
}

export function Page({
  deputes,
  groupesData,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  // Sur des vieilles législature, on n'a pas la notion de position politique
  const positionPolitiquesAreAvailable = deputes.every(_ => {
    return (
      _.latestGroup?.position_politique !== null ||
      _.latestGroup.acronym === 'NI'
    )
  })

  const deputesCurrent = deputes.filter(_ => _.mandat_ongoing)
  const deputesFormer = deputes.filter(_ => !_.mandat_ongoing)

  return (
    <div>
      <LegislatureNavigation
        title="Tous les députés"
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />

      <GrapheRepartitionGroupes {...{ groupesData }} />

      {positionPolitiquesAreAvailable ? (
        <>
          <DeputesOfSamePositionPolitique
            position_politique="Majoritaire"
            deputes={deputesCurrent}
            {...{ legislature }}
          />
          <DeputesOfSamePositionPolitique
            position_politique="Minoritaire"
            deputes={deputesCurrent}
            {...{ legislature }}
          />
          <DeputesOfSamePositionPolitique
            position_politique="Opposition"
            deputes={deputesCurrent}
            {...{ legislature }}
          />
          <SubsetOfDeputes
            title="Députés non inscrits dans un groupe"
            deputes={deputesCurrent.filter(
              _ => _.latestGroup?.acronym === 'NI',
            )}
            {...{ legislature }}
          />
          <SubsetOfDeputes
            title="Députés sans groupe"
            deputes={deputesCurrent.filter(_ => _.latestGroup === null)}
            {...{ legislature }}
          />
          <SubsetOfDeputes
            title="Anciens députés de cette législature"
            deputes={deputesFormer}
            {...{ legislature }}
          />
        </>
      ) : (
        <SubsetOfDeputes
          title="Tous les députés"
          deputes={deputes}
          {...{ legislature }}
        />
      )}

      {/* <div className="my-4 text-center">
        <h2 className="text-2xl">
          {deputesFormer.length} député(s) ont quitté leur mandat{' '}
        </h2>
        <p className="italic text-slate-700">
          Ils ont été nommés ministres, ou ont démissionné, etc.
        </p>
      </div> */}
    </div>
  )
}
