import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/dossierList/DossierList.render'
import * as server from '../../pageModules/dossierList/DossierList.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
