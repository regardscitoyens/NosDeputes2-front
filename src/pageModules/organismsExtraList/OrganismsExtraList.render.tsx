import { MyLink } from '../../components/MyLink'
import * as types from './OrganismsExtraList.types'

export function Page({ organismes }: types.Props) {
  return (
    <>
      <h1 className="mb-4 text-center text-2xl">
        Liste des missions extra-parlementaires
      </h1>
      <table className="w-full">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Membres</th>
          </tr>
        </thead>
        <tbody>
          {organismes.map(organisme => (
            <tr key={organisme.id} className="odd:bg-slate-200">
              <td>
                <MyLink href={`/organisme/${organisme.slug}`}>
                  {organisme.nom}
                </MyLink>
              </td>
              <td
                className={
                  organisme.deputesCount == 0 ? 'italic text-slate-400' : ''
                }
              >
                {organisme.deputesCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
