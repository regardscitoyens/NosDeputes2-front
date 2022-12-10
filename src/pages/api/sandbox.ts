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

  let fields: string[] = []
  allDeputesAllLegislatures.forEach(depute => {
    const adresses = depute.adresses ?? []
    let selection: any[] = []
    adresses.forEach(adresse => {
      if (adresse.xsiType === 'AdressePostale_Type') {
        // fields.push(...Object.keys(adresse))
        console.log('-', adresse.complementAdresse)
      }
    })
  })
  //   console.log(sortAndUniq(fields))

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
