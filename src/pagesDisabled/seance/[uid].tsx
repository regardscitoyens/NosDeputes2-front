import { InferGetStaticPropsType } from 'next'

import * as render from '../../pageModules/seanceFiche/SeanceFiche.render'
import * as server from '../../pageModules/seanceFiche/SeanceFiche.server'

export const getStaticPaths = server.getStaticPaths
export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
