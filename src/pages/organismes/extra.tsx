import { InferGetServerSidePropsType } from 'next'

import * as render from '../../pageModules/organismsExtraList/OrganismsExtraList.render'
import * as server from '../../pageModules/organismsExtraList/OrganismsExtraList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
