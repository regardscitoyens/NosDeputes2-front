import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/mandatsParCirco/MandatsParCirco.render'
import * as server from '../../pageModules/mandatsParCirco/MandatsParCirco.server'

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
