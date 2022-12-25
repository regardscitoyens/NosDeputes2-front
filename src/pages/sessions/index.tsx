import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/sessionList/SessionList.render'
import * as server from '../../pageModules/sessionList/SessionList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
