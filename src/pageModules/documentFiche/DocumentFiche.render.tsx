import { Todo } from '../../components/Todo'
import * as types from './DocumentFiche.types'

function buildTitle(texteLoi: types.TexteLoi) {
  return (
    <>
      <h1 className="text-center text-2xl">
        {texteLoi.type} n°{texteLoi.numero} {texteLoi.type_details}{' '}
        {texteLoi.titre}
      </h1>
      {texteLoi.subDocumentDetails ? (
        <>
          <h2 className="text-center text-3xl">
            Tome {texteLoi.subDocumentDetails.tomeNumber}
          </h2>
          {texteLoi.subDocumentDetails.annexeNumber !== null ? (
            <>
              <h3 className="text-center text-4xl">
                Annexe {texteLoi.subDocumentDetails.annexeNumber}
              </h3>
            </>
          ) : null}
        </>
      ) : null}
    </>
  )
}

export function Page(props: types.Props) {
  const { texteLoi, auteurs } = props
  return (
    <div>
      {buildTitle(texteLoi)}
      <div className="bg-slate-200 p-4">
        <h2 className="font-bold">Auteurs :</h2>
        <ul>
          {auteurs.map(auteur => (
            <li key={auteur.id}>{auteur.nom} </li>
          ))}
        </ul>
      </div>
      <Todo>Tout le document...</Todo>
    </div>
  )
}
