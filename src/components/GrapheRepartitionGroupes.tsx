import { DeputeWithGroupe } from '../logic/api'
import { getColorForGroupeAcronym } from '../logic/constants'
import { notNull } from '../logic/utils'

type Props = {
  deputes: DeputeWithGroupe[]
}

type GroupeData = {
  id: number
  nom: string
  slug: string
  acronym: string
  deputesCount: number
  deputesShareOfTotal: number
}

function buildGroupesData(deputes: DeputeWithGroupe[]): GroupeData[] {
  const groupesData: GroupeData[] = []
  const groupesFromDeputes = deputes.map((_) => _.groupe).filter(notNull)
  const nbDeputesWithGroupe = groupesFromDeputes.length
  groupesFromDeputes.forEach((groupe) => {
    if (groupe) {
      let groupeData = groupesData.find((_) => _.id === groupe.id)
      if (!groupeData) {
        groupeData = {
          ...groupe,
          deputesCount: 0,
          deputesShareOfTotal: 0,
        }
        groupesData.push(groupeData)
      }
      groupeData.deputesCount++
      groupeData.deputesShareOfTotal =
        groupeData.deputesCount / nbDeputesWithGroupe
    }
  })

  return groupesData
}

function Graphe({ groupesData }: { groupesData: GroupeData[] }) {
  return (
    <div className="flex h-10 flex-row shadow-lg">
      {groupesData.map((g) => {
        return (
          <div
            key={g.id}
            className="flex cursor-default items-center justify-center text-center text-white"
            style={{
              background: getColorForGroupeAcronym(g.acronym),
              width: `${g.deputesShareOfTotal * 100}%`,
            }}
          >
            {g.acronym}
          </div>
        )
      })}
    </div>
  )
}

function Legend({ groupesData }: { groupesData: GroupeData[] }) {
  return (
    <ul className="flex list-none flex-wrap items-baseline space-y-4 space-x-4">
      {groupesData.map((g) => (
        <li key={g.id} className="block">
          <span
            className={`mx-2 inline-block  py-1 px-2 text-white`}
            style={{
              background: getColorForGroupeAcronym(g.acronym),
            }}
          >
            {g?.acronym}
          </span>
          <span className="text-slate-400">{g.nom}</span>
        </li>
      ))}
      <li></li>
    </ul>
  )
}

export function GrapheRepartitionGroupes({ deputes }: Props) {
  const groupesData = buildGroupesData(deputes)
  return (
    <div className="space-y-2 bg-slate-100 py-4 px-4 ">
      <h2 className=" text-center text-lg text-slate-500">
        Groupes parlementaires
      </h2>
      <Graphe {...{ groupesData }} />
      <Legend {...{ groupesData }} />
    </div>
  )
}
