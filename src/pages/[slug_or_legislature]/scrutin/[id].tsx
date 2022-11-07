import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { MyLink } from '../../../components/MyLink'
import { Todo } from '../../../components/Todo'
import { db } from '../../../services/db'
import { CURRENT_LEGISLATURE } from '../../../services/hardcodedData'
import { formatDate, parseIntOrNull } from '../../../services/utils'
import groupBy from 'lodash/groupBy'

type Data = {
  scrutin: LocalScrutin
}

type LocalScrutin = {
  id: number
  titre: string
  seance_id: number | null
  date: string
  type: 'solennel' | 'ordinaire'
  sort: 'rejeté' | 'adopté'
  interventionMd5: string | null
  nombre_pours: number
  nombre_contres: number
  nombre_abstentions: number
  demandeurs: string | null
  votesGrouped: { [acronym: string]: LocalVote[] }
}

type LocalVote = {
  id: number
  parlementaire_id: number
  parlementaire_nom: string
  parlementaire_slug: string
  parlementaire_groupe_acronyme: string | null
  position: 'pour' | 'nonVotant' | 'abstention' | 'contre' | null
  position_groupe: string
  par_delegation: 1 | 0
  delegataire_parlementaire_id: number
  mise_au_point_position:
    | 'pour'
    | 'nonVotant'
    | 'abstention'
    | 'contre'
    | null
    | 'nonVotantVolontaire'
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const idStr = context.query.id as string
  const id = parseIntOrNull(idStr)
  if (!id) {
    return {
      notFound: true,
    }
  }
  const scrutinRaw = await db
    .selectFrom('scrutin')
    .where('id', '=', id)
    .select([
      'id',
      'type',
      'titre',
      'date',
      'seance_id',
      'nombre_pours',
      'nombre_contres',
      'nombre_abstentions',
      'demandeurs',
      'sort',
    ])
    .executeTakeFirst()

  const interventionMd5 = await db
    .selectFrom('tag')
    .leftJoin('tagging', 'tag.id', 'tagging.tag_id')
    .leftJoin('intervention', 'tagging.taggable_id', 'intervention.id')
    .where('tagging.taggable_model', '=', 'Intervention')
    .where('tag.is_triple', '=', 1)
    .where('tag.triple_namespace', '=', 'scrutin')
    .where('tag.triple_key', '=', 'numero')
    .where('tag.triple_value', '=', id.toString())
    .select('intervention.md5')
    .executeTakeFirst()

  const votes: LocalVote[] = await db
    .selectFrom('parlementaire_scrutin')
    .innerJoin(
      'parlementaire',
      'parlementaire.id',
      'parlementaire_scrutin.parlementaire_id',
    )
    .select([
      'parlementaire_scrutin.id',
      'parlementaire_scrutin.parlementaire_id',
      'parlementaire.nom as parlementaire_nom',
      'parlementaire.slug as parlementaire_slug',
      'parlementaire_scrutin.parlementaire_groupe_acronyme',
      'parlementaire_scrutin.position',
      'parlementaire_scrutin.position_groupe',
      'parlementaire_scrutin.par_delegation',
      'parlementaire_scrutin.delegataire_parlementaire_id',
      'parlementaire_scrutin.mise_au_point_position',
    ])
    .orderBy('position', 'desc')
    .orderBy('nom_de_famille')
    .where('parlementaire_scrutin.scrutin_id', '=', id)
    .execute()

  const votesGrouped: { [acronym: string]: LocalVote[] } = groupBy(
    votes,
    _ => _.parlementaire_groupe_acronyme,
  )

  if (!scrutinRaw) {
    return {
      notFound: true,
    }
  }
  const scrutin = {
    ...scrutinRaw,
    date: scrutinRaw.date.toISOString(),
    interventionMd5: interventionMd5?.md5 ?? null,
    demandeurs: scrutinRaw.demandeurs !== '' ? scrutinRaw.demandeurs : null,
    votesGrouped,
  }
  return {
    props: {
      data: {
        scrutin,
      },
    },
  }
}

// fichier référence php : apps/frontend/modules/scrutin/templates/showSuccess.php

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { scrutin } = data
  const {
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
  } = scrutin
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
            <Link
              href={`/${CURRENT_LEGISLATURE}/seance/${seance_id}#inter_${interventionMd5}`}
            >
              en séance publique
            </Link>
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
