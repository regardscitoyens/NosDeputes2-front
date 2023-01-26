import { InferGetStaticPropsType } from 'next'

import * as render from '../../pageModulesStatic/seanceFiche/SeanceFiche.render'
import * as server from '../../pageModulesStatic/seanceFiche/SeanceFiche.server'

export const getStaticPaths = server.getStaticPaths
export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
