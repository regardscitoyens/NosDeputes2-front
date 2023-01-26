import { InferGetStaticPropsType } from 'next'
import * as render from '../../pageModules/dossierList/DossierList.render'
import * as server from '../../pageModules/dossierList/DossierList.server'

export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
