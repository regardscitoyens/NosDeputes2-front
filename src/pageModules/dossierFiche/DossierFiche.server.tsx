import { GetServerSideProps } from 'next'
import { ActeLegislatif } from '../../lib/types/acteLegislatif'
import { dbReleve } from '../../lib/dbReleve'
import { Dossier } from '../../lib/types/dossier'
import * as types from './DossierFiche.types'
import uniq from 'lodash/uniq'
import { sql } from 'kysely'
import { arrIfDefined as arrIfDefined } from '../../lib/utils'

type Query = {
  id: string
}

function fixDate(date: string): string {
  // some date are like this : 2022-01-13+02:00
  if (date.indexOf('T') === -1) {
    return date.split('+')[0]
  }
  return date
}

function fixDatesContributionInternaute(acte: any): any {
  const { contributionInternaute } = acte
  if (contributionInternaute)
    return {
      ...acte,
      contributionInternaute: {
        ...(contributionInternaute.dateOuverture
          ? { dateOuverture: fixDate(contributionInternaute.dateOuverture) }
          : null),
        ...(contributionInternaute.dateFermeture
          ? { dateFermeture: fixDate(contributionInternaute.dateFermeture) }
          : null),
      },
    }
  else return acte
}

function removeBloat(acte: any): any {
  const { libelleActe } = acte
  return {
    ...fixDatesContributionInternaute(acte),
    libelleActe: libelleActe.nomCanonique,
    ...(acte.actesLegislatifs
      ? {
          actesLegislatifs: acte.actesLegislatifs.map(removeBloat),
        }
      : null),
  }
}

function collectOrganeRefsFromDossier(dossier: Dossier): string[] {
  return [
    ...arrIfDefined(dossier.initiateur?.organeRef),
    ...(dossier.actesLegislatifs?.flatMap(collectOrganeRefsFromActe) ?? []),
  ]
}

function collectActeursRefsFromDossier(dossier: Dossier): string[] {
  return [
    ...(dossier.initiateur?.acteurs?.map(_ => _.acteurRef) ?? []),
    ...(dossier.actesLegislatifs?.flatMap(collectActeursRefsFromActe) ?? []),
  ]
}

function collectOrganeRefsFromActe(acte: ActeLegislatif): string[] {
  const initiateurOrganeRef = arrIfDefined(
    acte.xsiType === 'CreationOrganeTemporaire_Type'
      ? acte.initiateur?.organeRef
      : undefined,
  )
  const childrenOrganeRef =
    acte.actesLegislatifs?.flatMap(collectOrganeRefsFromActe) ?? []

  return [acte.organeRef, ...initiateurOrganeRef, ...childrenOrganeRef]
}

function collectActeursRefsFromActe(acte: ActeLegislatif): string[] {
  // TODO lire les acteurs refs
  const childrenActeurRef =
    acte.actesLegislatifs?.flatMap(collectOrganeRefsFromActe) ?? []
  return [...childrenActeurRef]
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
  const acteurRefs = uniq(collectActeursRefsFromDossier(dossier))
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

  const acteurs = (
    await sql<{
      uid: string
      full_name: string
    }>`
SELECT
  uid, 
  CONCAT (
    data->'etatCivil'->'ident'->>'prenom',
    ' ',
    data->'etatCivil'->'ident'->>'nom'
  ) AS full_name
FROM acteurs
WHERE uid IN (${sql.join(acteurRefs)})
`.execute(dbReleve)
  ).rows

  return {
    props: {
      data: {
        dossier,
        organes,
        acteurs,
      },
    },
  }
}
