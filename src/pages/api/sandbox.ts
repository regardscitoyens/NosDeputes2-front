import { sql } from 'kysely'
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import lo from 'lodash'
import { type } from 'os'
// Dummy api routes to quickly explore some queries
export default async function sandbox(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  const allDeputesAllLegislatures = (
    await sql<{
      uid: string
      slug: string
      adresses: any[]
    }>`
  SELECT
    acteurs.uid AS uid,
    nosdeputes_deputes.slug,
    acteurs.data->'adresses' AS adresses
  FROM acteurs
  INNER JOIN nosdeputes_deputes
    ON nosdeputes_deputes.uid = acteurs.uid
  INNER JOIN mandats
    ON mandats.acteur_uid = acteurs.uid
  INNER JOIN organes
    ON organes.uid = ANY(mandats.organes_uids)
  WHERE
    organes.data->>'codeType' = 'ASSEMBLEE'
    AND organes.data->>'legislature' = '16'
  `.execute(dbReleve)
  ).rows

  const mandats = (
    await sql<{
      data: any
    }>`
  SELECT
    mandats.data,
    mandats.data->'collaborateurs' AS collaborateurs
  FROM  mandats
  INNER JOIN organes
    ON organes.uid = ANY(mandats.organes_uids)
  WHERE
    organes.data->>'codeType' = 'ASSEMBLEE'
  `.execute(dbReleve)
  ).rows

  let fields: string[] = []
  mandats.forEach(mandat => {
    const collaborateurs = mandat.data.collaborateurs ?? []
    collaborateurs.forEach((collab: any) => {
      fields.push(collab.qualite)
    })
  })
  console.log(sortAndUniq(fields))

  //   const fields = allDeputesAllLegislatures.flatMap(depute => {
  //     return (depute.adresses ?? []).map(
  //       adresse => adresse.xsiType + ' - ' + adresse.typeLibelle,
  //     )
  //   })
  //   console.log(lo.sortBy(lo.uniq(fields)), s => s)

  res.status(200).json({ name: 'John Doe' })
}

function sortAndUniq(arr: string[]) {
  return lo.sortBy(lo.uniq(arr), _ => _)
}
