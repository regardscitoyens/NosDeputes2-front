import { sql } from 'kysely'
import range from 'lodash/range'
import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import {
  FIRST_LEGISLATURE_FOR_SCRUTINS,
  LATEST_LEGISLATURE,
} from '../../lib/hardcodedData'
import * as types from './ScrutinList.types'

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
        destination: `/scrutins`,
      },
    }
  }
  const legislature = legislatureInPath ?? LATEST_LEGISLATURE
  const legislatureNavigationUrls = range(
    FIRST_LEGISLATURE_FOR_SCRUTINS,
    LATEST_LEGISLATURE + 1,
  ).map(l => {
    const tuple: [number, string] = [
      l,
      `/scrutins${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`,
    ]
    return tuple
  })

  const scrutins = (
    await sql<types.Scrutin>`
SELECT 
  uid,
  data->>'titre' AS title,
  data->'sort'->>'code' AS sort,
  data->'typeVote' AS type_vote,
  data->'demandeur'->>'texte' AS demandeur_texte,
  data->>'dateScrutin' AS date_scrutin
FROM scrutins
WHERE 
  data->>'legislature' = ${legislature.toString()}
ORDER BY date_scrutin DESC
  `.execute(dbReleve)
  ).rows

  return {
    props: {
      data: {
        legislature,
        legislatureNavigationUrls,
        scrutins,
      },
    },
  }
}
