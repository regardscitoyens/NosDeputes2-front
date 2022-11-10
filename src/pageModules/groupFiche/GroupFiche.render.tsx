import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import { DeputeItem } from '../../components/DeputeItem'
import {
  FonctionInGroupe,
  getColorForGroupeAcronym,
} from '../../lib/hardcodedData'

import * as types from './GroupFiche.types'

function GroupOfDeputes({
  title,
  deputes,
}: {
  title: string
  deputes: types.Depute[]
}) {
  if (deputes.length === 0) return null
  return (
    <div>
      <h2 className="text-2xl">{title}</h2>
      <ul className="list-none">
        {deputes.map(depute => {
          return (
            <li key={depute.id}>
              <DeputeItem {...{ depute }} withCirco />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const displayRankOfFonctions: Record<FonctionInGroupe, number> = {
  president: 1,
  membre: 2,
  apparente: 3,
}

export function Page({
  deputes: { current, former },
  groupeInfo: { nom, acronym },
}: types.Props) {
  const groupedByFonction = groupBy(current, _ => _.latestGroup.fonction) as {
    [fonction in FonctionInGroupe]: types.Depute[]
  }
  const entries = Object.entries(groupedByFonction) as [
    FonctionInGroupe,
    types.Depute[],
  ][]

  const groupedByFonctionAndOrdered = sortBy(
    entries,
    _ => displayRankOfFonctions[_[0]],
  )
  return (
    <div>
      <h1 className="text-center text-2xl">
        Groupe {nom}
        <span
          className={`mx-2 inline-block py-1 px-2 text-white`}
          style={{ background: getColorForGroupeAcronym(acronym) }}
        >
          {acronym}
        </span>
        ({current.length} députés)
      </h1>
      {groupedByFonctionAndOrdered.map(([fonction, deputes]) => {
        if (deputes.length === 0) return null
        const title =
          fonction === 'president'
            ? 'Président(e)'
            : fonction === 'apparente'
            ? 'Apparentés'
            : fonction === 'membre'
            ? 'Membres'
            : fonction
        return <GroupOfDeputes key={fonction} {...{ title, deputes }} />
      })}
      <GroupOfDeputes title="Anciens membres" deputes={former} />
    </div>
  )
}