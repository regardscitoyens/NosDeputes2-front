import { sql } from 'kysely'
import range from 'lodash/range'
import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import {
  FIRST_LEGISLATURE_FOR_REUNIONS_AND_SESSIONS as FIRST_LEGISLATURE_FOR_SEANCES,
  LATEST_LEGISLATURE,
} from '../../lib/hardcodedData'
import { querySessions } from '../../lib/querySessions'
import * as types from './SeanceList.types'

type Query = {
  legislature?: string
}

// TODO il faudra faire aussi les réunions de commission et les réunions à l'initiative des parlementaires, ptêt sur une autre page ?

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const query = context.query as Query
  const legislatureInPath = query.legislature
    ? parseInt(query.legislature, 10)
    : null
  if (legislatureInPath === LATEST_LEGISLATURE) {
    return {
      redirect: {
        permanent: false,
        destination: `/seances`,
      },
    }
  }
  const legislature = legislatureInPath ?? LATEST_LEGISLATURE
  const legislatureNavigationUrls = range(
    FIRST_LEGISLATURE_FOR_SEANCES,
    LATEST_LEGISLATURE + 1,
  ).map(l => {
    const tuple: [number, string] = [
      l,
      `/seances${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`,
    ]
    return tuple
  })

  const sessions = await querySessions(legislature)

  const sessionsWithSeances = await Promise.all(
    sessions.map(async session => {
      // We do one query by session. Could be optimized if needed
      const seances = (
        await sql<{ uid: string; session_ref: string; start_date: string }>`
SELECT 
  uid,
  data->>'sessionRef' AS session_ref,
  data->>'timestampDebut' AS start_date
FROM reunions
WHERE data->>'xsiType' = 'seance_type'
  AND data->'lieu'->>'lieuRef' = 'AN'
  AND data->'cycleDeVie'->>'etat' = 'Confirmé'
  AND data->>'sessionRef' = ${session.uid}
ORDER BY start_date
      `.execute(dbReleve)
      ).rows

      return { ...session, seances }
    }),
  )

  return {
    props: {
      data: {
        legislature,
        legislatureNavigationUrls,
        sessionsWithSeances,
      },
    },
  }
}
