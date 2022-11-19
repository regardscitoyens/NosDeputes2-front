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
    <Todo>
      Nuage de mots global. Chaque mot du nuage est un lien vers la recherche
    </Todo>
  )
}
