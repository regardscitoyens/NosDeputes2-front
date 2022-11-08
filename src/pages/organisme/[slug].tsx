import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/organismFiche/OrganismFiche.render'
import * as server from '../../pageModules/organismFiche/OrganismFiche.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
