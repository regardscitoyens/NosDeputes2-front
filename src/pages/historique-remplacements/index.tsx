import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/remplacements/Remplacements.render'
import * as server from '../../pageModules/remplacements/Remplacements.server'

export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetServerSidePropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
