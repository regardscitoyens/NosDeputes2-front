import { Todo } from '../../components/Todo'
import * as types from './DocumentFiche.types'

export function Page(props: types.Props) {
  const { texteLoi, auteurs } = props
  return (
    <div>
      <h1 className="text-center text-2xl">
        {/* il manque le "Tome 1" pour https://www.nosdeputes.fr/16/document/16-ti */}
        {/* vérifier encore avec plein d'exemples pour voir ce qu'il peut manquer  */}
        {texteLoi.type} n°{texteLoi.numero} {texteLoi.type_details}{' '}
        {texteLoi.titre}
      </h1>
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
