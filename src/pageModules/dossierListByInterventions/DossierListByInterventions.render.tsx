import { MyLink } from '../../components/MyLink'
import { CURRENT_LEGISLATURE } from '../../lib/hardcodedData'
import * as types from './DossierListByInterventions.types'

export function Page({ sections }: types.Props) {
  return (
    <div>
      <h1 className=" text-center text-2xl">Les dossiers parlementaires</h1>
      <h2 className="my-6 text-xl">
        Les dossiers les plus discutés à l'Assemblée
      </h2>
      <ul className="list-none">
        {sections.map(section => {
          const { id, titre_complet, nb_interventions } = section
          return (
            <li key={id} className="">
              <MyLink href={`/${CURRENT_LEGISLATURE}/dossier/${id}`}>
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
    </div>
  )
}
