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
      Carte des quelques circonscriptions constituant le département, et liste
      le député pour chacune de ces circonscriptions
    </Todo>
  )
}
