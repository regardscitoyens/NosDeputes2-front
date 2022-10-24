import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { Todo } from '../../components/Todo'
import {
  OrganismeWithCounts,
  queryOrganismsList,
} from '../../repositories/deputesAndOrganismesRepository'

type Data = { organismes: OrganismeWithCounts[] }

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const slug = context.query.slug as string
  const organismes = await queryOrganismsList('extra')
  return {
    props: {
      data: { organismes },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <Todo>a faire</Todo>
}
