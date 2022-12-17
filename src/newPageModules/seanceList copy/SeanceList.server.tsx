import { sql } from 'kysely'
import range from 'lodash/range'
import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import {
  FIRST_LEGISLATURE_FOR_REUNIONS_AND_SESSIONS as FIRST_LEGISLATURE_FOR_SEANCES,
  LATEST_LEGISLATURE,
} from '../../lib/hardcodedData'
import * as types from './SeanceList.types'

type Query = {
  legislature?: string
}

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

  const seances = (
    await sql<types.Seance>`
SELECT
  uid,
  data->>'timestampDebut' AS date_debut,
  data->>'sessionRef' AS session_ref
FROM reunions
WHERE
  legislature = ${legislature}
  AND data->'cycleDeVie'->>'etat' != ALL( '{Annulé, Supprimé}')
  AND data->>'xsiType' = 'seance_type'
  AND data->'lieu'->>'lieuRef' = 'AN'
ORDER BY data->>'timestampDebut' DESC
`.execute(dbReleve)
  ).rows

  // TODO après, faire aussi les réunions de commission et les réunions à l'initiative des parlementaires

  return {
    props: {
      data: {
        legislature,
        legislatureNavigationUrls,
        seances,
      },
    },
  }
}
