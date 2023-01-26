import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/scrutinList/ScrutinList.render'
import * as server from '../../pageModules/scrutinList/ScrutinList.server'

export const getStaticPaths = server.getStaticPaths
export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetServerSidePropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
