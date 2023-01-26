import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModulesStatic/scrutinList/ScrutinList.render'
import * as server from '../../pageModulesStatic/scrutinList/ScrutinList.server'

export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetServerSidePropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
