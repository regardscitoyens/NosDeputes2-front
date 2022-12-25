import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/deputeList/DeputeList.render'
import * as server from '../../pageModules/deputeList/DeputeList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
