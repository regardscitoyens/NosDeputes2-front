import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Todo } from '../../components/Todo'

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
    <div>
      <Todo>Recherche</Todo>
      <Todo>résultats de la recherche</Todo>
      <Todo>s'abonner aux résultats de cette recherche</Todo>
      <Todo>rechercher par législature</Todo>
      <Todo>affiner cette recherche</Todo>
    </div>
  )
}
