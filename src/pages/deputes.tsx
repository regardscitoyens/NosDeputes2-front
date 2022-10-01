import { AppContext } from 'next/app'
import { Depute, fetchDeputes } from '../api/api'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

type Data = {
  deputes: Depute[]
}

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context,
) => {
  const data = { deputes: await fetchDeputes() }
  return {
    props: { data },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      Liste des deputes, hemicycle, etc.
      {data.deputes.map((depute) => {
        return <li key={depute.id}>{depute.nom}</li>
      })}
    </div>
  )
}
