import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/seanceList/SeanceList.render'
import * as server from '../../pageModules/seanceList/SeanceList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
