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

  let actesCount = 0
  const nomCanoniquesForXsiType: { [k: string]: string[] } = {}
  const xsiTypeForNomCanonique: { [k: string]: string[] } = {}

  const keysFrequencies: { [k: string]: number } = {}

  function registerKeysOf(a: any) {
    Object.keys(a).forEach(k => {
      keysFrequencies[k] = keysFrequencies[k] | 0
      keysFrequencies[k]++
    })
  }
  function registerValue(a: string) {
    acc.push(a)
  }

  rows.forEach(row => {
    const { data } = row

    function handleActeLegislatif(_acte: any, level: number) {
      const acte = removeBloat(_acte)
      acte.actesLegislatifs?.forEach((child: any) => {
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

      const {
        actesLegislatifs,
        uid,
        codeActe,
        libelleActe,
        organeRef,
        xsiType: _xsiType,
        ...rest
      } = acte

      if (xsiType === 'Promulgation_Type') {
        // console.log(rest)
        actesCount++
        // registerKeysOf(rest.infoJoRect)
        // registerValue(rest.infoJoRect)
        rest.infoJoRect?.forEach(o => {
          registerKeysOf(o)
          registerValue(o.typeJo)
        })
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
      actesLegislatifs.forEach((acte: any) => {
        handleActeLegislatif(acte, 1)
      })
  })

  console.log(`Nombre d'actes sélectionnés`, actesCount)

  console.log('Fréquence de chaque clé')
  console.log(
    Object.fromEntries(lo.sortBy(Object.entries(keysFrequencies), _ => -_[1])),
  )

  console.log('Valeurs uniques', sortAndUniq(acc))

  res.status(200).json({ name: 'John Doe' })
}

function sortAndUniq(arr: string[]) {
  return lo.sortBy(lo.uniq(arr), _ => _)
}

function exists(a: any): string {
  if (a !== undefined) return 'defined'
  return 'undefined'
}
