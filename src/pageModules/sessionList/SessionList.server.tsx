import { GetStaticPaths, GetStaticProps } from 'next'
import { FIRST_LEGISLATURE_FOR_REUNIONS_AND_SESSIONS } from '../../lib/hardcodedData'
import { querySessions } from '../../lib/querySessions'
import {
  buildLegislaturesNavigationUrls,
  buildStaticPaths,
  readLegislatureFromContext,
} from '../../lib/routingUtils'
import * as types from './SessionList.types'

const basePath = '/sessions'

const firstLegislature = FIRST_LEGISLATURE_FOR_REUNIONS_AND_SESSIONS

export const getStaticPaths: GetStaticPaths<types.Params> = () => {
  return buildStaticPaths(firstLegislature)
}

export const getStaticProps: GetStaticProps<
  types.Props,
  types.Params
> = async context => {
  const legislature = readLegislatureFromContext(context)
  const legislatureNavigationUrls = buildLegislaturesNavigationUrls(
    firstLegislature,
    basePath,
  )
  const sessions = await querySessions(legislature)

  return {
    props: {
      legislature,
      legislatureNavigationUrls,
      sessions,
    },
  }
}
