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
          Ordre du jour :<p>{JSON.stringify(seance.ordre_du_jour)}</p>
        </div>
      )}
    </div>
  )
}
