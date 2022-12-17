import { InferGetServerSidePropsType } from 'next'
import * as render from '../../newPageModules/seanceList/SeanceList.render'
import * as server from '../../newPageModules/seanceList/SeanceList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
