import { sql } from 'kysely'
import { GetStaticPaths, GetStaticProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import { transformSeanceOdj } from '../../lib/transformSeanceOdj'
import * as compteRenduTypes from '../../lib/types/compteRendu'
import * as seanceTypes from '../../lib/types/seance'
import * as types from './SeanceFiche.types'

export const getStaticPaths: GetStaticPaths<types.Params> = async () => {
  const seances = (
    await sql<{
      uid: string
    }>`
SELECT 
uid
FROM reunions
WHERE data->>'xsiType' = 'seance_type'
AND data->'lieu'->>'lieuRef' = 'AN'
AND data->'cycleDeVie'->>'etat' = 'Confirmé'
  `.execute(dbReleve)
  ).rows

  return {
    paths: seances.map(_ => ({ params: { uid: _.uid } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<
  types.Props,
  types.Params
> = async context => {
  const uid = context.params?.uid
  if (!uid) {
    throw new Error('Missing uid in params')
  }
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
      seance,
      compteRendu,
    },
  }
}
