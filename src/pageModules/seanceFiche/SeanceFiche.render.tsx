import { Todo } from '../../components/Todo'
import { formatDate } from '../../lib/utils'
import * as types from './SeanceFiche.types'
import { SeanceSummary } from '../../components/SeanceSummary'

export function Page({ seance, seanceSummary }: types.Props) {
  return (
    <div>
      <h1 className="text-center text-2xl">
        Séance en hémicycle du {formatDate(seance.date)} à {seance.moment}
      </h1>
      <h2 className="text-xl">Résumé de la séance</h2>
      <Todo>Graphe de répartition des temps de parole</Todo>
      <Todo>Mots clefs de la séance</Todo>
      <h3 className="text-xl">Sommaire</h3>
      <SeanceSummary seanceSummary={seanceSummary} />
      <h2 className="text-xl">La séance</h2>
      <Todo>La séance</Todo>
    </div>
  )
}
