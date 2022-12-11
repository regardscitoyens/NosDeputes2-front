import { MyLink } from '../../components/MyLink'
import { LATEST_LEGISLATURE } from '../../lib/hardcodedData'
import * as types from './DossierListByDate.types'

export function Page({ sectionsGroupedByMonth }: types.Props) {
  return (
    <div>
      <h1 className="text-center text-2xl">Les dossiers parlementaires</h1>
      <h2 className="text-xl">Les derniers dossiers traités à l'Assemblée</h2>
      <ul className="list-none">
        {sectionsGroupedByMonth.map(entry => {
          const [month, sections] = entry
          return (
            <li key={month} className="my-4">
              <h2 className="text-xl font-bold">{month}</h2>
              <ul className="list-none">
                {sections.map(section => {
                  const { id, min_date, titre_complet, nb_interventions } =
                    section
                  return (
                    <li key={id}>
                      <MyLink href={`/${LATEST_LEGISLATURE}/dossier/${id}`}>
                        <span className="text-slate-500">{min_date}</span>{' '}
                        {titre_complet}{' '}
                        {nb_interventions > 0 ? (
                          <span className="italic text-slate-500">
                            {nb_interventions} intervention(s)
                          </span>
                        ) : null}
                      </MyLink>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
