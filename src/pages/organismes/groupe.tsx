import { InferGetServerSidePropsType } from 'next'

import * as render from '../../pageModules/groupesList/GroupesList.render'
import * as server from '../../pageModules/groupesList/GroupesList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
