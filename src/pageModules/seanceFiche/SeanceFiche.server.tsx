import { sql } from 'kysely'
import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import {
  PointOdjRawFromDb,
  transformSeanceOdj,
} from '../../lib/transformSeanceOdj'
import * as types from './SeanceFiche.types'

type Query = {
  uid: string
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const query = context.query as Query
  const uid = query.uid

  const seanceRaw =
    (
      await sql<{
        uid: string
        session_ref: string
        start_date: string
        ordre_du_jour: PointOdjRawFromDb[] | null
      }>`
SELECT 
uid,
data->>'timestampDebut' AS start_date,
data->'odj'->'pointsOdj' AS ordre_du_jour
FROM reunions
WHERE data->>'xsiType' = 'seance_type'
AND data->'lieu'->>'lieuRef' = 'AN'
AND uid = ${uid}
  `.execute(dbReleve)
    ).rows[0] ?? null
  if (!seanceRaw) {
    return {
      notFound: true,
    }
  }
  const seance = {
    ...seanceRaw,
    ordre_du_jour: transformSeanceOdj(seanceRaw.ordre_du_jour),
  }

  const compteRendu = {}

  return {
    props: {
      data: {
        seance,
        compteRendu,
      },
    },
  }
}
