import { InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/seanceList/SeanceList.render'
import * as server from '../../pageModules/seanceList/SeanceList.server'

export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetServerSidePropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
