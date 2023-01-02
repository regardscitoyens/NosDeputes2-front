import { sql } from 'kysely'
import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import { transformSeanceOdj } from '../../lib/transformSeanceOdj'
import * as compteRenduTypes from '../../lib/types/compteRendu'
import * as seanceTypes from '../../lib/types/seance'
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
        ordre_du_jour: seanceTypes.PointOdjRawFromDb[] | null
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

  const compteRendu =
    (
      await sql<{ data: compteRenduTypes.CompteRendu }>`
SELECT 
data
FROM comptesrendus
WHERE data->>'seanceRef' = ${uid}
`.execute(dbReleve)
    ).rows[0]?.data ?? null
  if (!compteRendu) {
    // pas sûr si ce cas est possible
    return {
      notFound: true,
    }
  }

  return {
    props: {
      data: {
        seance,
        compteRendu,
      },
    },
  }
}
