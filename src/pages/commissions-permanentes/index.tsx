import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/comPermList/ComPermList.render'
import * as server from '../../pageModules/comPermList/ComPermList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
