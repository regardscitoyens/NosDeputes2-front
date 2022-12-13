import { sql } from 'kysely'
import range from 'lodash/range'
import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import { FIRST_LEGISLATURE, LATEST_LEGISLATURE } from '../../lib/hardcodedData'
import * as types from './ReunionList.types'

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
        destination: `/reunions`,
      },
    }
  }
  const legislature = legislatureInPath ?? LATEST_LEGISLATURE
  const legislatureNavigationUrls = range(
    FIRST_LEGISLATURE,
    LATEST_LEGISLATURE,
  ).map(l => {
    const tuple: [number, string] = [
      l,
      `/reunions${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`,
    ]
    return tuple
  })

  const reunions = (
    await sql<types.Reunion>`
SELECT
  uid,
  data->>'xsiType' AS xsi_type
FROM reunions
WHERE legislature = ${legislature}
`.execute(dbReleve)
  ).rows

  return {
    props: {
      data: {
        legislature,
        legislatureNavigationUrls,
        reunions,
      },
    },
  }
}
