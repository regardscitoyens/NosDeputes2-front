import { MyLink } from '../../components/MyLink'
import { Todo } from '../../components/Todo'
import { isCommissionPermanente } from '../../lib/hardcodedData'
import * as types from './OrganismsParlementaireList.types'

export function Page({ organismes }: types.Props) {
  return (
    <div>
      <h1 className="mb-4 text-center text-2xl">
        Liste des fonctions parlementaires (commissions, délégations,
        missions...)
      </h1>
      <Todo inline>
        Distinguer les "missions terminées" des autres ? la query de nosdeputes
        me parait un peu louche à ce niveau, est-ce que c'est vraiment une
        information qu'on a ?
      </Todo>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Membres</th>
            <th>Réunions publiques</th>
          </tr>
        </thead>
        <tbody>
          {organismes.map(organisme => (
            <tr key={organisme.id} className="odd:bg-slate-200">
              <td>
                {isCommissionPermanente(organisme.slug) ? (
                  <span className="mr-2 cursor-default text-sm italic text-slate-500">
                    (commission permanente)
                  </span>
                ) : null}
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
              <td
                className={
                  organisme.seancesCount == 0 ? 'italic text-slate-400' : ''
                }
              >
                {organisme.seancesCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}