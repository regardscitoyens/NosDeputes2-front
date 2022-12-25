import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/dossierFiche/DossierFiche.render'
import * as server from '../../pageModules/dossierFiche/DossierFiche.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
