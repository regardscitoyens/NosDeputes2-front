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

function transformOdj(
  ordre_du_jour: types.PointOdjRawFromDb[] | null,
): types.PointOdjFinal[] {
  return (ordre_du_jour ?? [])
    .filter(
      _ => _.cycleDeVie.etat !== 'Annulé' && _.cycleDeVie.etat !== 'Supprimé',
    )
    .map(_ => {
      return {
        uid: _.uid,
        typePointOdj: _.typePointOdj,
        ...(_.procedure ? { procedure: _.procedure } : null),
        objet: _.objet,
        ...(_.dossiersLegislatifsRefs
          ? { dossierLegislatifRef: _.dossiersLegislatifsRefs[0] }
          : null),
      }
    })
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

  const sessions = await querySessions(legislature)

  const sessionsWithSeances = await Promise.all(
    sessions.map(async session => {
      // We do one query by session. Could be optimized if needed
      const seances = (
        await sql<{
          uid: string
          session_ref: string
          start_date: string
          ordre_du_jour: types.PointOdjRawFromDb[] | null
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
        if (!row.ordre_du_jour) {
          console.log(row.start_date)
        }
        return {
          ...row,
          ordre_du_jour: transformOdj(row.ordre_du_jour),
        }
      })

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
