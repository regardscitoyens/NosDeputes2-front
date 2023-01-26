import { sql } from 'kysely'
import mapValues from 'lodash/mapValues'
import { GetStaticPaths, GetStaticProps } from 'next'
import { addLatestGroupToDepute } from '../../lib/addLatestGroup'
import { dbReleve } from '../../lib/dbReleve'
import { LATEST_LEGISLATURE } from '../../lib/hardcodedData'
import { readLegislatureFromContext } from '../../lib/routingUtils'
import * as types from './DeputeFiche.types'

async function queryStats(
  uid: string,
  legislature: number,
): Promise<types.Depute['stats']> {
  const row = await dbReleve
    .selectFrom('nosdeputes_deputes_weekly_stats')
    .where('uid', '=', uid)
    .where('legislature', '=', legislature)
    .select('data')
    .executeTakeFirst()
  const statsRaw =
    (row?.data as types.WeeklyStats<types.StatsRawFromDb>) ?? null
  if (statsRaw) {
    return mapValues(statsRaw, raw => ({
      isVacances: raw.isVacances,
      presences: raw.nb_presences_commission + raw.nb_presences_hemicycle,
      mediane_presences: raw.mediane_presences_total,
    }))
  }
  return null
}

async function queryLegislatures(
  deputeUid: string,
): Promise<types.Depute['legislatures']> {
  return (
    await sql<{ legislature: number }>`
SELECT DISTINCT 
  (organes.data->>'legislature')::int AS legislature
FROM acteurs
INNER JOIN mandats
  ON mandats.acteur_uid = acteurs.uid
INNER JOIN organes
  ON organes.uid = ANY(mandats.organes_uids)
WHERE
  organes.data->>'codeType' = 'ASSEMBLEE'
  AND acteurs.uid = ${deputeUid}
ORDER BY legislature
  `.execute(dbReleve)
  ).rows.map(_ => _.legislature)
}

async function queryMandatsOfDeputesInLegislature(
  deputeUid: string,
  legislature: number,
): Promise<types.Mandat[]> {
  return (
    await sql<types.Mandat>`
SELECT
  mandats.uid,
  mandats.data->'election'->>'causeMandat' AS cause_mandat,
  mandats.data->'mandature'->>'causeFin' AS cause_fin,
  mandats.data->'mandature'->>'datePriseFonction' AS date_debut,
  mandats.data->>'dateFin' AS date_fin
FROM acteurs
INNER JOIN mandats
  ON mandats.acteur_uid = acteurs.uid
INNER JOIN organes
  ON organes.uid = ANY(mandats.organes_uids)
WHERE
  organes.data->>'codeType' = 'ASSEMBLEE'
  AND organes.data->>'legislature' = ${legislature}
  AND acteurs.uid = ${deputeUid}
  ORDER BY date_debut
    `.execute(dbReleve)
  ).rows
}

async function queryCollaborateursInMandat(
  mandatUid: string,
): Promise<types.Collaborateur[]> {
  return (
    await sql<{ full_name: string }>`
WITH subquery AS (
  SELECT
    jsonb_array_elements(mandats.data->'collaborateurs') AS collaborateurs
  FROM mandats
  WHERE
    mandats.uid = ${mandatUid}
)
SELECT 
  CONCAT(collaborateurs->>'prenom', ' ', collaborateurs->>'nom') AS full_name
FROM subquery
    `.execute(dbReleve)
  ).rows
}

export const getStaticPathsOlderLegislatures: GetStaticPaths<
  types.Params
> = async () => {
  const deputes = (
    await sql<{ slug: string; legislature: string }>`
    SELECT DISTINCT
      nosdeputes_deputes.slug,
      organes.data->>'legislature' AS legislature
  FROM acteurs
  INNER JOIN mandats ON acteurs.uid = mandats.acteur_uid
  INNER JOIN organes ON organes.uid = ANY(mandats.organes_uids)
  LEFT JOIN nosdeputes_deputes ON nosdeputes_deputes.uid = acteurs.uid
  WHERE organes.data->>'codeType' = 'ASSEMBLEE'
  AND organes.data->>'legislature' != ${LATEST_LEGISLATURE.toString()}
  AND nosdeputes_deputes.slug IS NOT NULL
    `.execute(dbReleve)
  ).rows

  return {
    paths: deputes.map(_ => {
      const { slug, legislature } = _
      return {
        params: {
          slug,
          legislature,
        },
      }
    }),
    fallback: false,
  }
}

export const getStaticPathsLatestLegislatures: GetStaticPaths<
  types.Params
> = async () => {
  const deputes = (
    await sql<{ slug: string }>`
    SELECT DISTINCT
      nosdeputes_deputes.slug
  FROM acteurs
  INNER JOIN mandats ON acteurs.uid = mandats.acteur_uid
  INNER JOIN organes ON organes.uid = ANY(mandats.organes_uids)
  LEFT JOIN nosdeputes_deputes ON nosdeputes_deputes.uid = acteurs.uid
  WHERE organes.data->>'codeType' = 'ASSEMBLEE'
  AND organes.data->>'legislature' = ${LATEST_LEGISLATURE.toString()}
  AND nosdeputes_deputes.slug IS NOT NULL
    `.execute(dbReleve)
  ).rows

  return {
    paths: deputes.map(_ => {
      const { slug } = _
      return {
        params: {
          slug,
        },
      }
    }),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<
  types.Props,
  types.Params
> = async context => {
  if (!context.params) {
    throw new Error('Missing params')
  }
  const slug = context.params.slug
  const legislature = readLegislatureFromContext(context)

  const depute =
    (
      await sql<{
        uid: string
        full_name: string
        date_of_birth: string
        gender: 'H' | 'F'
        adresses: types.Adresses
        circo_departement: string
        circo_number: number
        legislature_date_debut: string
        legislature_date_fin: string | null
      }>`
SELECT
  acteurs.uid AS uid,
  CONCAT(
  	acteurs.data->'etatCivil'->'ident'->>'prenom',
  	' ',
  	acteurs.data->'etatCivil'->'ident'->>'nom'
  ) AS full_name,
  acteurs.data->'etatCivil'->'infoNaissance'->>'dateNais' AS date_of_birth,
  CASE
    WHEN acteurs.data->'etatCivil'->'ident'->>'civ' = 'M.' THEN 'H'
    ELSE 'F'
  END as gender,
  acteurs.adresses,
  mandats.data->'election'->'lieu'->>'departement' AS circo_departement,
  (mandats.data->'election'->'lieu'->>'numCirco')::int AS circo_number,
  organes.data->'viMoDe'->>'dateDebut' AS legislature_date_debut,
  organes.data->'viMoDe'->>'dateFin' AS legislature_date_fin
FROM acteurs
INNER JOIN nosdeputes_deputes
  ON nosdeputes_deputes.uid = acteurs.uid
INNER JOIN mandats
  ON mandats.acteur_uid = acteurs.uid
INNER JOIN organes
  ON organes.uid = ANY(mandats.organes_uids)
WHERE
  organes.data->>'codeType' = 'ASSEMBLEE'
  AND organes.data->>'legislature' = ${legislature}
  AND slug = ${slug}
`.execute(dbReleve)
    ).rows[0] ?? null
  if (!depute) {
    return {
      notFound: true,
    }
  }

  const { legislature_date_debut, legislature_date_fin, ...restOfDepute } =
    depute

  const deputeWithLatestGroup = await addLatestGroupToDepute(
    restOfDepute,
    legislature,
  )

  const mandats_this_legislature = await queryMandatsOfDeputesInLegislature(
    depute.uid,
    legislature,
  )
  const lastMandat =
    mandats_this_legislature.length > 0
      ? mandats_this_legislature[mandats_this_legislature.length - 1]
      : null
  const legislatures = await queryLegislatures(depute.uid)
  const legislatureNavigationUrls = legislatures.map(l => {
    const tuple: [number, string] = [
      l,
      `/${slug}${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`,
    ]
    return tuple
  })
  // Théoriquement le député pourrait avoir eu des collaborateurs différents dans le mandat précédent dans la même législature
  // Mais en fait il semble que dans l'open data, les collaborateurs ne sont présents que pour le dernier mandat de la dernière législature (donc les données disparaissent ?)
  const collaborateursInLastMandat = lastMandat
    ? await queryCollaborateursInMandat(lastMandat.uid)
    : []

  const stats = await queryStats(depute.uid, legislature)
  // TODO requêter tous les champs que j'ai hardcodé ici temporairement
  const returnedDepute: types.Depute = {
    slug,
    mandats_this_legislature,
    legislatures,
    collaborateurs: collaborateursInLastMandat,
    amendements: {
      Adopté: { proposes: 0, signes: 0 },
      Indéfini: { proposes: 0, signes: 0 },
      Irrecevable: { proposes: 0, signes: 0 },
      'Non soutenu': { proposes: 0, signes: 0 },
      Rejeté: { proposes: 0, signes: 0 },
      Retiré: { proposes: 0, signes: 0 },
      'Retiré avant séance': { proposes: 0, signes: 0 },
      Tombe: { proposes: 0, signes: 0 },
    },
    responsabilites: [],
    votes: [],
    stats,
    ...deputeWithLatestGroup,
  }

  const legislatureDates = {
    date_debut: legislature_date_debut,
    date_fin: legislature_date_fin,
  }

  return {
    props: {
      legislature,
      legislatureNavigationUrls,
      depute: returnedDepute,
      legislatureDates,
    },
  }
}
