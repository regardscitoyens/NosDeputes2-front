import { InferGetStaticPropsType } from 'next'
import * as render from '../../pageModules/dossierFiche/DossierFiche.render'
import * as server from '../../pageModules/dossierFiche/DossierFiche.server'

export const getStaticPaths = server.getStaticPaths
export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
