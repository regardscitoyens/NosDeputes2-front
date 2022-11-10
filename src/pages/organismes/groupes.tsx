import { InferGetServerSidePropsType } from 'next'

import * as render from '../../pageModules/groupesEtudesAmitieList/GroupesEtudesAmitieList.render'
import * as server from '../../pageModules/groupesEtudesAmitieList/GroupesEtudesAmitieList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
