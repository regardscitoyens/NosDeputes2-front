import { Todo } from '../../components/Todo'
import { MyLink } from '../../components/MyLink'
import { CURRENT_LEGISLATURE } from '../../lib/hardcodedData'
import { formatDate } from '../../lib/utils'
import * as types from './ScrutinFiche.types'

function getColorClassForPosition(
  position:
    | 'pour'
    | 'nonVotant'
    | 'abstention'
    | 'contre'
    | null
    | 'nonVotantVolontaire',
): string {
  switch (position) {
    case 'pour':
      return 'text-green-700'
    case 'contre':
      return 'text-red-700'
    default:
      return 'text-slate-600'
  }
}

export function Page({
  scrutin: {
    id,
    type,
    titre,
    date,
    seance_id,
    interventionMd5,
    sort,
    nombre_pours,
    nombre_contres,
    nombre_abstentions,
    demandeurs,
    votesGrouped,
  },
}: types.Props) {
  const sourceUrl = `https://www2.assemblee-nationale.fr/scrutins/detail/(legislature)/${CURRENT_LEGISLATURE}/(num)/${id}`
  return (
    <div>
      <h1 className="text-center text-2xl">
        Scrutin public {type} n°{id}
      </h1>
      <h2 className="text-xl">Sur {titre}</h2>
      <MyLink className="block text-slate-500" href={sourceUrl} targetBlank>
        Source
      </MyLink>
      <p>
        Voté dans l'hémicycle le {formatDate(date)}
        {seance_id ? (
          <>
            {' '}
            <MyLink
              href={`/${CURRENT_LEGISLATURE}/seance/${seance_id}#inter_${interventionMd5}`}
            >
              en séance publique
            </MyLink>
          </>
        ) : null}
      </p>
      <div>
        Résultat : <span className="font-semibold">{sort}</span>
        <ul className="list-disc">
          <li>Pour : {nombre_pours}</li>
          <li>Contre : {nombre_contres}</li>
          <li>Abstention : {nombre_abstentions}</li>
        </ul>
      </div>
      {demandeurs ? <p>A la demande de : {demandeurs}</p> : null}

      <div>
        Votes:
        <ul className="ml-8 list-disc">
          {Object.entries(votesGrouped).map(([acronym, votes]) => {
            return (
              <li key={acronym}>
                {acronym}
                <ul className="ml-8 list-disc">
                  {votes.map(vote => {
                    return (
                      <li key={vote.id}>
                        <MyLink href={`/${vote.parlementaire_slug}`}>
                          {vote.parlementaire_nom}
                        </MyLink>{' '}
                        <span
                          className={`font-bold ${getColorClassForPosition(
                            vote.position,
                          )}`}
                        >
                          {vote.position}
                        </span>
                        {vote.par_delegation === 1 ? (
                          <>
                            {' '}
                            <span className="text-slate-500">
                              (par délégation)
                            </span>
                          </>
                        ) : null}
                        {vote.mise_au_point_position !== null ? (
                          <>
                            {' '}
                            (Mise au point :{' '}
                            <span
                              className={`font-bold ${getColorClassForPosition(
                                vote.mise_au_point_position,
                              )}`}
                            >
                              {vote.mise_au_point_position}
                            </span>
                            )
                          </>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ul>
      </div>
      <Todo>Tout le dossier...</Todo>
    </div>
  )
}
