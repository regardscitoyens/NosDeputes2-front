import { InferGetStaticPropsType } from 'next'
import * as render from '../../pageModulesStatic/remplacementsList/RemplacementsList.render'
import * as server from '../../pageModulesStatic/remplacementsList/RemplacementsList.server'

export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
