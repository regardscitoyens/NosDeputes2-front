import range from 'lodash/range'
import { GetStaticPropsContext } from 'next'
import { LATEST_LEGISLATURE } from './hardcodedData'

export function buildLegislaturesFrom(firstLegislature: number) {
  return range(firstLegislature, LATEST_LEGISLATURE + 1)
}

export function buildStaticPaths(firstLegislature: number) {
  const availableLegislatures = buildLegislaturesFrom(firstLegislature)
  const paths = availableLegislatures
    .filter(_ => _ !== LATEST_LEGISLATURE)
    .map(_ => ({
      params: { legislature: _.toString() },
    }))
  return {
    paths,
    fallback: false,
  }
}

export function readLegislatureFromContext(
  context: GetStaticPropsContext<{ legislature?: string }>,
) {
  const legislatureParam = context.params?.legislature
  return legislatureParam ? parseInt(legislatureParam, 10) : LATEST_LEGISLATURE
}

export function buildLegislaturesNavigationUrls(
  firstLegislature: number,
  basePath: string,
): [number, string][] {
  const availableLegislatures = buildLegislaturesFrom(firstLegislature)
  return availableLegislatures.map(l => {
    const tuple: [number, string] = [
      l,
      `${basePath}${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`,
    ]
    return tuple
  })
}
