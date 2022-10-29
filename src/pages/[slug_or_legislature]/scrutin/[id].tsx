import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { MyLink } from '../../../components/MyLink'
import { Todo } from '../../../components/Todo'
import { db } from '../../../repositories/db'
import { CURRENT_LEGISLATURE } from '../../../services/hardcodedData'
import { formatDate } from '../../../services/utils'

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
}

function parseIntOrNull(str: string): number | null {
  const parsed = parseInt(str)
  if (isNaN(parsed)) return null
  return parsed
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

  if (!scrutinRaw) {
    return {
      notFound: true,
    }
  }
  const scrutin = {
    ...scrutinRaw,
    date: scrutinRaw.date.toISOString(),
    interventionMd5: interventionMd5?.md5 ?? null,
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
  } = scrutin
  const sourceUrl = `https://www2.assemblee-nationale.fr/scrutins/detail/(legislature)/${CURRENT_LEGISLATURE}/(num)/${id}`

  return (
    <div>
      <h1 className="text-center text-2xl">
        Scrutin public {type} n°{id}
      </h1>
      <h2 className="text-xl">Sur {titre}</h2>
      <MyLink className="block text-slate-500" href={sourceUrl}>
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
        <ul>
          <li>Pour : {nombre_pours}</li>
          <li>Contre : {nombre_contres}</li>
          <li>Abstention : {nombre_abstentions}</li>
        </ul>
      </div>
      <Todo>Tout le dossier...</Todo>
    </div>
  )
}
