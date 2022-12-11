import { MyLink } from '../../components/MyLink'
import { LATEST_LEGISLATURE } from '../../lib/hardcodedData'
import { formatDate } from '../../lib/utils'
import * as types from './ScrutinList.types'

function ScrutinList({
  scrutins,
  law,
}: {
  scrutins: types.Scrutin[]
  law?: string
}) {
  return (
    <ul className={`${law ? 'ml-16' : ''} list-disc`}>
      {scrutins.map(scrutin => {
        const { titre, id, date } = scrutin
        const finalTitre = law ? titre.replace(law, '...') : titre
        return (
          <li key={id} className="odd:bg-slate-200 ">
            <MyLink href={`/${LATEST_LEGISLATURE}/scrutin/${id}`}>
              {formatDate(date)} : {finalTitre}
            </MyLink>
          </li>
        )
      })}
    </ul>
  )
}
export function Page({ scrutinsOnWhole, othersScrutinsByLaw }: types.Props) {
  return (
    <>
      <div className="flex flex-row">
        <div className="w-1/2 px-8">
          <h1 className="my-4 text-2xl">Les scrutins sur l'ensemble</h1>
          <ScrutinList scrutins={scrutinsOnWhole} />
        </div>
        <div className="w-1/2 ">
          <h1 className="my-4 text-2xl">Autres scrutins</h1>
          <ul>
            {Object.entries(othersScrutinsByLaw).map(([law, scrutins]) => (
              <li key={law}>
                {law} :
                <ScrutinList {...{ scrutins, law }} />{' '}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
