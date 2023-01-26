import { InferGetServerSidePropsType, InferGetStaticPropsType } from 'next'

import * as render from '../../pageModules/deputeFiche/DeputeFiche.render'
import * as server from '../../pageModules/deputeFiche/DeputeFiche.server'

export const getStaticPaths = server.getStaticPathsLatestLegislatures
export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
