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
FROM dossiers
  `.execute(dbReleve)
  ).rows

  console.log('@@@ got dossiers', rows.length)

  const acc: string[] = []
  const keys = [
    'actesLegislatifs',
    'anneeDecision',
    'auteurMotion',
    'auteursRefs',
    'casSaisine',
    'codeActe',
    'codeLoi',
    'contributionInternaute',
    'dateActe',
    'decision',
    'depotInitialLectureDefinitiveRef',
    'formuleDecision',
    'infoJo',
    'infoJoRect',
    'infoJoce',
    'initiateur',
    'libelleActe',
    'motif',
    'numDecision',
    'odjRef',
    'organeRef',
    'provenanceRef',
    'rapporteurs',
    'referenceNor',
    'reunionRef',
    'statutAdoption',
    'statutConclusion',
    'texteAdopteRef',
    'texteAssocieRef',
    'texteEuropeen',
    'texteLoiRef',
    'textesAssocies',
    'titreLoi',
    'typeDeclaration',
    'typeMotion',
    'typeMotionCensure',
    'uid',
    'urlConclusion',
    'urlEcheancierLoi',
    'urlLegifrance',
    'voteRefs',
    'xsiType',
  ]
  rows.forEach(row => {
    const { data } = row
    // console.log('SEANCE', row.start_date)

    // fusionDossier?: {
    //   cause: 'Dossier absorbé' | 'Examen commun'
    //   dossierAbsorbantRef: string
    // }

    function handleActeLegislatif(acte: any, level: number) {
      const { actesLegislatifs } = acte
      actesLegislatifs?.forEach(child => {
        handleActeLegislatif(child, level + 1)
      })

      if (level > 1) {
        const field = 'infoJo'
        const value = acte[field]
        if (value) {
          acc.push(value.referenceNor)
        }
      }
    }

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
