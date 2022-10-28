import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { Todo } from '../../../components/Todo'
import { db } from '../../../repositories/db'

type Data = {
  scrutin: LocalScrutin
}

type LocalScrutin = {
  id: number
  type: 'solennel' | 'ordinaire'
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
  const scrutin = await db
    .selectFrom('scrutin')
    .where('id', '=', id)
    .select('id')
    .select('type')
    .executeTakeFirst()
  if (!scrutin) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      data: {
        scrutin,
      },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { scrutin } = data
  const { id, type } = scrutin
  return (
    <div>
      <h1 className="text-center text-2xl">
        Scrutin public {type} n°{id}
      </h1>
      <Todo>Tout le dossier...</Todo>
    </div>
  )
}
