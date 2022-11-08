import { InferGetServerSidePropsType } from 'next'

import * as render from '../../pageModules/organismsParlementaireList/OrganismsParlementaireList.render'
import * as server from '../../pageModules/organismsParlementaireList/OrganismsParlementaireList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
