import { sql } from 'kysely'
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import lo from 'lodash'
import { type } from 'os'
import { querySessions } from '../../lib/querySessions'
// Dummy api routes to quickly explore some queries
export default async function sandbox(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  const sessions = (
    await Promise.all([querySessions(15), querySessions(16)])
  ).flat()

  const sessionsWithSeances = await Promise.all(
    sessions.map(async session => {
      // We do one query by session. Could be optimized if needed
      const seances = (
        await sql<{
          uid: string
          session_ref: string
          start_date: string
          odj: { pointsOdj?: any[] }
        }>`
SELECT 
  uid,
  data->>'sessionRef' AS session_ref,
  data->>'timestampDebut' AS start_date,
  data->'odj' AS odj
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

  const seances = sessionsWithSeances.flatMap(s => s.seances)

  console.log('@@@ got seances', seances.length)

  /*

'comiteSecret',
  'cycleDeVie',
  */

  const acc: string[] = []
  seances.forEach(seance => {
    seance.odj.pointsOdj?.forEach(pointOdj => {
      console.log('SEANCE', seance.start_date)
      acc.push(JSON.stringify(pointOdj.procedure) ?? '-missing-')
      console.log(pointOdj)
    })

    // acc.push(Array.isArray(seance.odj.pointsOdj) + '')
    // if (!Array.isArray(seance.odj.pointsOdj)) {
    // console.log(seance.odj)
    // }
  })

  console.log('@@@', sortAndUniq(acc))

  res.status(200).json({ name: 'John Doe' })
}

function sortAndUniq(arr: string[]) {
  return lo.sortBy(lo.uniq(arr), _ => _)
}
