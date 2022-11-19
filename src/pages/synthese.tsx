import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Todo } from '../components/Todo'

type Data = {}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  return {
    props: {
      data: {},
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Todo>
      Synthèse générale de l'activité parlementaire depuis le début de la
      législature
    </Todo>
  )
}
