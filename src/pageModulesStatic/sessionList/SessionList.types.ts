import * as sessionTypes from '../../lib/types/session'

export type Params = {
  legislature?: string
}

export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  sessions: sessionTypes.Session[]
}
