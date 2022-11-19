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
      Un député au hasard: fetch les députes puis faire une redirection
      javascript vers son URL ?
    </Todo>
  )
}
