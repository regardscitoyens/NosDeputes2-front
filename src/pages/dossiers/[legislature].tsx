import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModulesStatic/dossierList/DossierList.render'
import * as server from '../../pageModulesStatic/dossierList/DossierList.server'

export const getStaticPaths = server.getStaticPaths
export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetServerSidePropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
