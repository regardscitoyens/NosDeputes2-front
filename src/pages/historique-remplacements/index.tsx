import { InferGetStaticPropsType } from 'next'
import * as render from '../../pageModules/remplacementsList/RemplacementsList.render'
import * as server from '../../pageModules/remplacementsList/RemplacementsList.server'

export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
