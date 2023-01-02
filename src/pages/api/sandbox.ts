import { sql } from 'kysely'
import lo from 'lodash'
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbReleve } from '../../lib/dbReleve'

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
FROM comptesrendus
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

  function typ(a: any): string {
    if (typeof a !== 'object') return typeof a
    if (Array.isArray(a)) return 'array'
    return 'object'
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

  function sortAndUniq(arr: string[]) {
    return lo.sortBy(lo.uniq(arr), _ => _)
  }

  rows.forEach(row => {
    const { data } = row

    const {
      contenu: { point },
    } = row.data

    const allPoints: any[] = []

    function handlePoint(p: any) {
      if (Array.isArray(p)) {
        p.forEach(handlePoint)
      } else {
        allPoints.push(p)
        if (p.point) {
          handlePoint(p.point)
        }
      }
    }
    handlePoint(point)

    allPoints.forEach(p => {
      const { texte } = p
      if (texte && typeof texte !== 'string') {
        const { exposant } = texte
        if (typ(exposant) === 'array') {
          exposant.forEach(o => {
            count++
            registerValue(typ(o))
          })
        }
      }
    })
    // registerValue(Array.isArray(point))
    // registerValue(
    //   row.data.demandeur.texte,
    //   //   '- ' +
    //   // row.data.typeVote.typeMajorite,
    // )
  })

  console.log(`Nombre d'éléments`, count)
  console.log('Fréquence de chaque clé')
  console.log(
    Object.fromEntries(lo.sortBy(Object.entries(keysFrequencies), _ => -_[1])),
  )
  console.log('Valeurs uniques', sortAndUniq(acc))
  res.status(200).json({ message: 'done' })
}

function exists(a: any): string {
  if (a !== undefined) return 'defined'
  return 'undefined'
}
