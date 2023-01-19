import { sql } from 'kysely'
import lo from 'lodash'
import type { NextApiRequest, NextApiResponse } from 'next'
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

  const acc: string[] = []

  function str(a: any) {
    return JSON.stringify(a)
  }

  function keys(a: any) {
    return Object.keys(a)
  }

  function json(a: any): string {
    return JSON.stringify(a)
  }

  let count = 0

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

      const { xsiType } = _acte
      const nbActesLegislatifs = _acte.actesLegislatifs?.length

      if (xsiType === 'NominRapporteurs_Type') {
        //...
      }
    }
    const { actesLegislatifs } = data
    if (actesLegislatifs) {
      actesLegislatifs.forEach((acte: any) => {
        handleActeLegislatif(acte, 1)
      })
    }
  })

  console.log(`Nombre d'éléments`, count)

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
