import { InferGetServerSidePropsType } from 'next'
import * as render from '../../newPageModules/sessionList/SessionList.render'
import * as server from '../../newPageModules/sessionList/SessionList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
