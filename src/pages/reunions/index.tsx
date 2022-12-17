import { InferGetServerSidePropsType } from 'next'
import * as render from '../../newPageModules/reunionList/ReunionList.render'
import * as server from '../../newPageModules/reunionList/ReunionList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
