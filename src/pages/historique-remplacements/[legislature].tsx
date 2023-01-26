import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/remplacements/Remplacements.render'
import * as server from '../../pageModules/remplacements/Remplacements.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
