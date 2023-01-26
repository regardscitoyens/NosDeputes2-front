import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModulesStatic/seanceList/SeanceList.render'
import * as server from '../../pageModulesStatic/seanceList/SeanceList.server'

export const getStaticPaths = server.getStaticPaths
export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetServerSidePropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
