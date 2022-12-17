import { InferGetServerSidePropsType } from 'next'
import * as render from '../../newPageModules/deputeList/DeputeList.render'
import * as server from '../../newPageModules/deputeList/DeputeList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
