import { GetServerSideProps } from 'next'
import { ActeLegislatif } from '../../lib/acteLegislatif'
import { dbReleve } from '../../lib/dbReleve'
import { Dossier } from '../../lib/dossier'
import * as types from './DossierFiche.types'
import uniq from 'lodash/uniq'
import { sql } from 'kysely'

type Query = {
  id: string
}

function removeBloat(acte: any): any {
  const { libelleActe } = acte
  return {
    ...acte,
    libelleActe: libelleActe.nomCanonique,
    ...(acte.actesLegislatifs
      ? {
          actesLegislatifs: acte.actesLegislatifs.map(removeBloat),
        }
      : null),
  }
}

function collectOrganeRefsFromDossier(dossier: Dossier): string[] {
  return dossier.actesLegislatifs?.flatMap(collectOrganeRefsFromActe) ?? []
}

function collectOrganeRefsFromActe(acte: ActeLegislatif): string[] {
  const initiateurOrganeRef =
    acte.xsiType === 'CreationOrganeTemporaire_Type'
      ? acte.initiateur?.organeRef
      : undefined
  const childrenOrganeRef =
    acte.actesLegislatifs?.flatMap(collectOrganeRefsFromActe) ?? []

  return [
    acte.organeRef,
    ...(initiateurOrganeRef ? [initiateurOrganeRef] : []),
    ...childrenOrganeRef,
  ]
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const query = context.query as Query
  const id = query.id

  const dossierRaw = await dbReleve
    .selectFrom('dossiers')
    .where('uid', '=', id)
    .select('data')
    .executeTakeFirst()

  if (!dossierRaw) {
    return {
      notFound: true,
    }
  }
  const data = dossierRaw.data as any
  const dossier: Dossier = {
    ...data,
    ...(data.actesLegislatifs
      ? {
          actesLegislatifs: data.actesLegislatifs.map(removeBloat),
        }
      : null),
  }

  const organeRefs = uniq(collectOrganeRefsFromDossier(dossier))
  const organes = (
    await sql<{
      uid: string
      libelle: string
    }>`
SELECT
	uid,
	data->>'libelle' AS libelle
FROM organes
WHERE uid IN (${sql.join(organeRefs)})
`.execute(dbReleve)
  ).rows

  return {
    props: {
      data: {
        dossier,
        organes,
      },
    },
  }
}
