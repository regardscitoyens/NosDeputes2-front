import { sql } from 'kysely'
import uniq from 'lodash/uniq'
import { GetStaticPaths, GetStaticProps } from 'next'
import { addLatestGroupToDeputes } from '../../lib/addLatestGroup'
import { dbReleve } from '../../lib/dbReleve'
import { LATEST_LEGISLATURE } from '../../lib/hardcodedData'
import * as acteTypes from '../../lib/types/acte'
import * as dossierTypes from '../../lib/types/dossier'
import { arrIfDefined } from '../../lib/utils'
import * as types from './DossierFiche.types'

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

function collectOrganeRefsFromDossier(dossier: dossierTypes.Dossier): string[] {
  return [
    ...arrIfDefined(dossier.initiateur?.organeRef),
    ...(dossier.actesLegislatifs?.flatMap(collectOrganeRefsFromActe) ?? []),
  ]
}

function collectActeursRefsFromDossier(
  dossier: dossierTypes.Dossier,
): string[] {
  return [
    ...(dossier.initiateur?.acteurs?.map(_ => _.acteurRef) ?? []),
    ...(dossier.actesLegislatifs?.flatMap(collectActeursRefsFromActe) ?? []),
  ]
}

function collectOrganeRefsFromActe(acte: acteTypes.ActeLegislatif): string[] {
  const initiateurOrganeRef = arrIfDefined(
    acte.xsiType === 'CreationOrganeTemporaire_Type'
      ? acte.initiateur?.organeRef
      : undefined,
  )
  const childrenOrganeRef =
    acteTypes.getChildrenOfActe(acte).flatMap(collectOrganeRefsFromActe) ?? []

  return [acte.organeRef, ...initiateurOrganeRef, ...childrenOrganeRef]
}

function collectActeursRefsFromActe(acte: acteTypes.ActeLegislatif): string[] {
  const childrenActeurRef =
    acteTypes.getChildrenOfActe(acte).flatMap(collectActeursRefsFromActe) ?? []
  const rapporteursRef =
    acte.xsiType === 'NominRapporteurs_Type'
      ? acte.rapporteurs.map(_ => _.acteurRef)
      : []
  const initiateursRenvoiCmpRef =
    acte.xsiType === 'RenvoiCMP_Type'
      ? acte.initiateur.acteurs.map(_ => _.acteurRef)
      : []
  const initiateursSaisieCcRef =
    acte.xsiType === 'SaisineConseilConstit_Type'
      ? acte.initiateur?.acteurs.map(_ => _.acteurRef) ?? []
      : []
  return [
    ...initiateursRenvoiCmpRef,
    ...initiateursSaisieCcRef,
    ...rapporteursRef,
    ...childrenActeurRef,
  ]
}

export const getStaticPaths: GetStaticPaths<types.Params> = async () => {
  const dossiers = await dbReleve.selectFrom('dossiers').select('uid').execute()
  return {
    paths: dossiers.map(_ => ({ params: { id: _.uid } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<
  types.Props,
  types.Params
> = async context => {
  const id = context.params?.id
  if (!id) {
    throw new Error('Missing id in params')
  }
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
  const dossier: dossierTypes.Dossier = {
    ...data,
    ...(data.actesLegislatifs
      ? {
          actesLegislatifs: data.actesLegislatifs.map(removeBloat),
        }
      : null),
  }

  const organeRefs = uniq(collectOrganeRefsFromDossier(dossier))
  // TODO en fait je crois qu'il faudrait s'intéresser à la notion de mandatRef. Car sinon on confond les députés et les ministres (ex Elisabeth Borne qui dépose des lois en tant que ministre mais techniquement elle était aussi députée)
  const acteurRefs = uniq(collectActeursRefsFromDossier(dossier))
  const organes = (
    await sql<{
      uid: string
      libelle: string
      code_type: types.OrganeCodeType
    }>`
SELECT
	uid,
	data->>'libelle' AS libelle,
	data->>'codeType' AS code_type
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

  // Note: some acteurs here are not deputes and thus no group will be found. That's ok
  const acteursWithGroupes = await addLatestGroupToDeputes(
    acteurs,
    // TODO is this correct ? we don't have a notion of legislature for a dossier
    // maybe we should make a version of this query where we do not care about legislature, just take whatever was the latest group
    LATEST_LEGISLATURE,
  )

  return {
    props: {
      dossier,
      organes,
      acteurs: acteursWithGroupes,
    },
  }
}
