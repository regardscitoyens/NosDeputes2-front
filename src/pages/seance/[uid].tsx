import { InferGetServerSidePropsType } from 'next'

import * as render from '../../pageModules/seanceFiche/SeanceFiche.render'
import * as server from '../../pageModules/seanceFiche/SeanceFiche.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
