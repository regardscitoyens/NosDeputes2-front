import { pickTextColor } from '../lib/utils'
import { MyLink } from './MyLink'

type Props = {
  groupesData: LocalGroupData[]
}

type LocalGroupData = {
  nom: string
  acronym: string
  deputesShareOfTotal: number
  color: string
}

function Graphe({ groupesData }: { groupesData: LocalGroupData[] }) {
  return (
    <div className="flex h-10 flex-row shadow-lg">
      {groupesData.map(g => {
        return (
          <div
            key={g.acronym}
            className={`flex cursor-default items-center justify-center text-center ${pickTextColor(
              g.color,
            )}`}
            style={{
              background: g.color,
              width: `${g.deputesShareOfTotal * 100}%`,
              // order: groupesDisplayOrder.indexOf(g.acronym) ?? 0,
            }}
          >
            {g.acronym}
          </div>
        )
      })}
    </div>
  )
}

function Legend({ groupesData }: { groupesData: LocalGroupData[] }) {
  return (
    <ul className="flex list-none flex-wrap items-baseline space-y-4 space-x-4">
      {groupesData.map(g => (
        <li key={g.acronym} className="block">
          <MyLink href={`/groupe/${g.acronym}`}>
            <span
              className={`mx-2 inline-block  py-1 px-2 ${pickTextColor(
                g.color,
              )}`}
              style={{
                background: g.color,
              }}
            >
              {g?.acronym}
            </span>
            <span className="text-slate-400">{g.nom}</span>
          </MyLink>
        </li>
      ))}
      <li></li>
    </ul>
  )
}

export function GrapheRepartitionGroupes({ groupesData }: Props) {
  return (
    <div className="mb-4 space-y-2 bg-slate-100 py-4 px-4 ">
      <h2 className=" text-center text-lg text-slate-500">
        Groupes parlementaires
      </h2>
      <Graphe {...{ groupesData }} />
      <Legend {...{ groupesData }} />
    </div>
  )
}
