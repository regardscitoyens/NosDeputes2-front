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
  return (
    <div>
      Page du depute {depute.nom}
      <div className="mx-auto max-w-sm space-y-2 rounded-xl bg-white py-8 px-8 shadow-lg sm:flex sm:items-center sm:space-y-0 sm:space-x-6 sm:py-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <p className="text-lg font-semibold text-black">{depute.nom}</p>
          <p className="font-medium text-slate-500">{depute.groupe_acronyme}</p>
        </div>
      </div>
    </div>
  )
}
