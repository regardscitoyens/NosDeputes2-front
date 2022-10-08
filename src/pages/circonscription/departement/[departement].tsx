import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Todo } from '../../../components/Todo'

type Data = {}

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context,
) => {
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
      Carte des circonscriptions pour un département, et liens vers les députés
      de cette circonscription
    </Todo>
  )
}
