import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModulesStatic/dossierFiche/DossierFiche.render'
import * as server from '../../pageModulesStatic/dossierFiche/DossierFiche.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
