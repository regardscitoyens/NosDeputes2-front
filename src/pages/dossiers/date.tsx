import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/dossierListByDate/DossierListByDate.render'
import * as server from '../../pageModules/dossierListByDate/DossierListByDate.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
