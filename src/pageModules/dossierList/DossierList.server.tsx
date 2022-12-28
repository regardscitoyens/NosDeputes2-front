import { sql } from 'kysely'
import range from 'lodash/range'
import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import {
  FIRST_LEGISLATURE_FOR_DOSSIERS,
  FIRST_LEGISLATURE_FOR_REUNIONS_AND_SESSIONS,
  LATEST_LEGISLATURE,
} from '../../lib/hardcodedData'
import * as types from './DossierList.types'

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
        destination: `/dossiers`,
      },
    }
  }
  const legislature = legislatureInPath ?? LATEST_LEGISLATURE
  const legislatureNavigationUrls = range(
    FIRST_LEGISLATURE_FOR_DOSSIERS,
    LATEST_LEGISLATURE + 1,
  ).map(l => {
    const tuple: [number, string] = [
      l,
      `/dossiers${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`,
    ]
    return tuple
  })

  const dossiers = (
    await sql<types.Dossier>`
SELECT 
  uid,
  data->'titreDossier'->>'titre' AS title,
  data->'procedureParlementaire'->>'libelle' AS procedure
FROM dossiers
WHERE 
  data->>'legislature' = ${legislature.toString()}
ORDER BY title
  `.execute(dbReleve)
  ).rows
  return {
    props: {
      data: {
        legislature,
        legislatureNavigationUrls,
        dossiers,
      },
    },
  }
}
