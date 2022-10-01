import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Depute, fetchDeputes } from '../api/api'

type Data = {
  depute: Depute
}

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context,
) => {
  const slug = context.query.slug as string
  const deputes = await fetchDeputes()
  const depute = deputes.find((_) => _.slug == slug)
  if (!depute) {
    return {
      notFound: true,
    }
  }
  const data = { depute }
  return {
    props: { data },
  }
}

export default function Page({
  data: { depute },
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <div>Page du depute {depute.nom}</div>
}
