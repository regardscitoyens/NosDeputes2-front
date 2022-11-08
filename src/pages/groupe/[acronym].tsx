import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/groupFiche/GroupFiche.render'
import * as server from '../../pageModules/groupFiche/GroupFiche.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
