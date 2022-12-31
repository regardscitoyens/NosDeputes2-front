import { formatDateWithTimeAndWeekday } from '../../lib/utils'
import * as types from './SeanceFiche.types'

export function Page(props: types.Props) {
  const { seance, compteRendu } = props
  console.log('@@@@ seance', seance)
  console.log('@@@@ compteRendu', compteRendu)
  return (
    <div className="">
      <h1 className=" text-center text-2xl">
        Fiche de la séance du {formatDateWithTimeAndWeekday(seance.start_date)}
      </h1>
      {seance.ordre_du_jour && (
        <div>
          Ordre du jour :
          <pre>{JSON.stringify(seance.ordre_du_jour, null, 2)}</pre>
        </div>
      )}
      <h2 className="my-4 text-center text-xl">Compte rendu</h2>
      <div>
        <pre>{JSON.stringify(compteRendu.contenu, null, 2)}</pre>
      </div>
    </div>
  )
}
