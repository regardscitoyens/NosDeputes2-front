import { InferGetStaticPropsType } from 'next'
import * as render from '../../pageModules/sessionList/SessionList.render'
import * as server from '../../pageModules/sessionList/SessionList.server'

export const getStaticProps = server.getStaticProps

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  return <render.Page {...props} />
}
