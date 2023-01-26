import { sql } from 'kysely'
import { GetStaticPaths, GetStaticProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import { FIRST_LEGISLATURE_FOR_REUNIONS_AND_SESSIONS as FIRST_LEGISLATURE_FOR_SEANCES } from '../../lib/hardcodedData'
import { querySessions } from '../../lib/querySessions'
import {
  buildLegislaturesNavigationUrls,
  buildStaticPaths,
  readLegislatureFromContext,
} from '../../lib/routingUtils'
import { transformSeanceOdj } from '../../lib/transformSeanceOdj'
import * as seanceTypes from '../../lib/types/seance'
import * as types from './SeanceList.types'

const basePath = '/seances'
const firstLegislature = FIRST_LEGISLATURE_FOR_SEANCES

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

  const sessionsWithSeances = await Promise.all(
    sessions.map(async session => {
      // We do one query by session. Could be optimized if needed
      const seances = (
        await sql<{
          uid: string
          session_ref: string
          start_date: string
          ordre_du_jour: seanceTypes.PointOdjRawFromDb[] | null
        }>`
SELECT 
  uid,
  data->>'sessionRef' AS session_ref,
  data->>'timestampDebut' AS start_date,
  data->'odj'->'pointsOdj' AS ordre_du_jour
FROM reunions
WHERE data->>'xsiType' = 'seance_type'
  AND data->'lieu'->>'lieuRef' = 'AN'
  AND data->'cycleDeVie'->>'etat' = 'Confirmé'
  AND data->>'sessionRef' = ${session.uid}
ORDER BY start_date
      `.execute(dbReleve)
      ).rows.map(row => {
        return {
          ...row,
          ordre_du_jour: transformSeanceOdj(row.ordre_du_jour),
        }
      })

      return { ...session, seances }
    }),
  )

  return {
    props: {
      legislature,
      legislatureNavigationUrls,
      sessionsWithSeances,
    },
  }
}
