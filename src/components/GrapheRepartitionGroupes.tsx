import { GroupeData } from '../logic/rearrangeData'
import {
  getColorForGroupeAcronym,
  groupesDisplayOrder,
} from '../logic/hardcodedData'

type Props = {
  groupesData: GroupeData[]
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
              order: groupesDisplayOrder.indexOf(g.acronym) ?? 0,
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

export function GrapheRepartitionGroupes({ groupesData }: Props) {
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
