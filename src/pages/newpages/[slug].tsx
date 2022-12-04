import { InferGetServerSidePropsType } from 'next'

import * as render from '../../newPageModules/deputeFiche/DeputeFiche.render'
import * as server from '../../newPageModules/deputeFiche/DeputeFiche.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
