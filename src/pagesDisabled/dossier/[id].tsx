import { InferGetStaticPropsType } from 'next'
import * as render from '../../pageModulesStatic/dossierFiche/DossierFiche.render'
import * as server from '../../pageModulesStatic/dossierFiche/DossierFiche.server'

export const getStaticPaths = server.getStaticPaths
export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
