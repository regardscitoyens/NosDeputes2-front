import { sql } from 'kysely'
import lo from 'lodash'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ActeLegislatif } from '../../lib/acteLegislatif'
import { dbReleve } from '../../lib/dbReleve'

function removeBloat(acte: any): any {
  const { libelleActe } = acte
  return {
    ...acte,
    libelleActe: libelleActe.nomCanonique,
  }
}

// Dummy api routes to quickly explore some queries
export default async function sandbox(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  const rows = (
    await sql<{
      uid: string
      data: any
    }>`
SELECT 
uid,
data
FROM dossiers
  `.execute(dbReleve)
  ).rows

  console.log('@@@ got dossiers', rows.length)

  const acc: string[] = []

  function str(a: any) {
    return JSON.stringify(a)
  }

  function keys(a: any) {
    return Object.keys(a)
  }

  const nomCanoniquesForXsiType: { [k: string]: string[] } = {}
  const xsiTypeForNomCanonique: { [k: string]: string[] } = {}

  rows.forEach(row => {
    const { data } = row
    // console.log('SEANCE', row.start_date)

    // fusionDossier?: {
    //   cause: 'Dossier absorbé' | 'Examen commun'
    //   dossierAbsorbantRef: string
    // }

    function handleActeLegislatif(_acte: any, level: number) {
      const acte = removeBloat(_acte)
      acte.actesLegislatifs?.forEach(child => {
        handleActeLegislatif(child, level + 1)
      })
      // ---
      // ---
      // ---
      // ---
      // ---
      // ---
      // ---
      // ---
      // ---

      const xsiType = acte.xsiType as ActeLegislatif['xsiType']

      const { actesLegislatifs, ...rest } = acte

      if (xsiType === 'DepotInitiative_Type') {
        console.log(rest)
      }
    }
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    // ---
    const { actesLegislatifs } = data
    if (actesLegislatifs)
      actesLegislatifs.forEach(acte => {
        handleActeLegislatif(acte, 1)
      })
    // acc.push(
    //   data.plf?.flatMap(_ => _.rapporteurs?.map(_ => _.typeRapporteur)) ??
    //     '-UNDEFINED-',
    // )
    // console.log(pointOdj)

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

function exists(a: any): string {
  if (a !== undefined) return 'defined'
  return 'undefined'
}
