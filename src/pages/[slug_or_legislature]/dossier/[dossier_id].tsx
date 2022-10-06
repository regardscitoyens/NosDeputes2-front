import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { Todo } from '../../../components/Todo'

type Data = {
  dossier: {
    id: number
    nom: string
    date: string
    nbInterventions?: number
  }
}

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context,
) => {
  return {
    props: {
      data: {
        dossier: {
          id: 312,
          nom: 'Clôture de la session extraordinaire',
          date: '2022-08-04T00:00:00.000',
        },
      },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { dossier } = data
  return (
    <div>
      <h1 className="text-2xl">{dossier.nom}</h1>
      <Todo>Tout le dossier...</Todo>
    </div>
  )
}
