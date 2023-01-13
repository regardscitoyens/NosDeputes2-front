import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

import { getNomDepartement } from '../../../lib/hardcodedData'

// Nxt needs a default export even with redirect
export default function Page({}: InferGetServerSidePropsType<
  typeof getServerSideProps
>) {
  return <div>redirect</div>
}

export const getServerSideProps: GetServerSideProps<{}> = async context => {
  const idDepartement = context.query.query
  if (!idDepartement || Array.isArray(idDepartement)) {
    throw new Error(`Mandatory ${idDepartement}`)
  }
  const nomDepartement = getNomDepartement(idDepartement)
  return {
    redirect: {
      destination: `/circonscription/departement/${encodeURIComponent(
        nomDepartement,
      )}`,
      permanent: false,
    },
  }
}
