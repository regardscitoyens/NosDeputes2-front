import { InferGetServerSidePropsType } from 'next'
import * as render from '../../../pageModules/documentFiche/DocumentFiche.render'
import * as server from '../../../pageModules/documentFiche/DocumentFiche.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
