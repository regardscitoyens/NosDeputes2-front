import { InferGetServerSidePropsType } from 'next'

import * as render from '../../pageModules/scrutinList/ScrutinList.render'
import * as server from '../../pageModules/scrutinList/ScrutinList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
