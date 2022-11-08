import { InferGetServerSidePropsType } from 'next'

import * as render from '../../../pageModules/scrutinFiche/ScrutinFiche.render'
import * as server from '../../../pageModules/scrutinFiche/ScrutinFiche.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
