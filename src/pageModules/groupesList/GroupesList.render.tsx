import { GrapheRepartitionGroupes } from '../../components/GrapheRepartitionGroupes'
import { MyLink } from '../../components/MyLink'
import { getColorForGroupeAcronym } from '../../lib/hardcodedData'
import * as types from './GroupesList.types'

export function Page({ groupes }: types.Props) {
  return (
    <div className="space-y-4">
      <h1 className="text-center text-2xl">Liste des groupes politiques</h1>
      <table className="w-full bg-slate-100  text-slate-500">
        <thead>
          <tr>
            <th>Intitulé</th>
            <th>Membres</th>
          </tr>
        </thead>
        <tbody>
          {groupes.map(g => (
            <tr key={g.id}>
              <td className="py-2">
                <MyLink href={`/groupe/${g.acronym}`}>
                  <span
                    className={`mx-2 inline-block py-1 px-2 text-white`}
                    style={{
                      background: getColorForGroupeAcronym(g.acronym),
                    }}
                  >
                    {g.acronym}
                  </span>
                  {g.nom}
                </MyLink>
              </td>
              <td className="text-center">{g.deputesCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <GrapheRepartitionGroupes groupesData={groupes} />
    </div>
  )
}
