import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import { DeputeItem } from '../../components/DeputeItem'
import { FonctionInOrganisme as FonctionInOrganism } from '../../lib/hardcodedData'

import * as types from './OrganismFiche.types'

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

const fonctionInDisplayOrder: FonctionInOrganism[] = [
  'président délégué',
  'président de droit',
  'président',
  'co-président',
  'vice-président',
  'deuxième vice-président',
  'questeur',
  'secrétaire',
  'rapporteur général',
  'rapporteur',
  'co-rapporteur',
  'chargé de mission',
  'membre du bureau',
  'membre avec voix délibérative',
  'membre avec voix consultative',
  'membre de droit',
  'membre titulaire',
  'membre nommé',
  'membre',
  'membre suppléant',
  'apparenté',
]

export function Page({ organisme }: types.Props) {
  const { deputes } = organisme

  const formerDeputes = deputes.filter(_ => !_.currentMember)
  const currentDeputes = deputes.filter(_ => _.currentMember)

  const groupedByFonction = groupBy(currentDeputes, _ => _.fonction) as {
    [fonction in FonctionInOrganism]: types.Depute[]
  }
  const entries = Object.entries(groupedByFonction) as [
    FonctionInOrganism,
    types.Depute[],
  ][]

  const groupedByFonctionAndOrdered = sortBy(entries, _ =>
    fonctionInDisplayOrder.indexOf(_[0]),
  )

  return (
    <div>
      <h1 className="text-center text-2xl">
        {organisme.nom} ({currentDeputes.length} député(s))
      </h1>
      {groupedByFonctionAndOrdered.map(([fonction, deputes]) => {
        if (deputes.length === 0) return null
        const title = fonction + ''
        return <GroupOfDeputes key={fonction} {...{ title, deputes }} />
      })}
      <GroupOfDeputes title="Anciens membres" deputes={formerDeputes} />
    </div>
  )
}
