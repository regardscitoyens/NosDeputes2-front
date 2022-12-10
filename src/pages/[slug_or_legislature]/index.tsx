import { InferGetServerSidePropsType } from 'next'

import * as render from '../../pageModules/deputeFiche/OldDeputeFiche.render'
import * as server from '../../pageModules/deputeFiche/OldDeputeFiche.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
