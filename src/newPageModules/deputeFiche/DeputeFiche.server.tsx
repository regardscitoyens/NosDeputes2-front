import { sql } from 'kysely'
import { GetServerSideProps } from 'next'
import PHPUnserialize from 'php-unserialize'
import { dbReleve } from '../../lib/dbReleve'
import { addLatestGroupToDepute } from '../../lib/newAddLatestGroup'
import * as types from './DeputeFiche.types'

function parseMails(mails: string): string[] {
  const unserialized = PHPUnserialize.unserialize(mails)
  if (unserialized) {
    return Object.values(unserialized) as string[]
  }
  return []
}

function parseCollaborateurs(
  collaborateursStr: string,
): types.DeputeCollaborateur[] {
  const unserialized = PHPUnserialize.unserialize(collaborateursStr)
  if (unserialized) {
    const collaborateurs = Object.values(unserialized) as string[]
    // todo: resolve collaborateur link
    return collaborateurs.map(name => ({
      name,
    }))
  }
  return []
}

function parseAdresses(adresses: string): string[] {
  const unserialized = PHPUnserialize.unserialize(adresses)
  if (unserialized) {
    return Object.values(PHPUnserialize.unserialize(adresses)) as string[]
  }
  return []
}

function parseDeputeUrls(depute: {
  url_an: string
  sites_web: string | null
  nom: string
}): types.DeputeUrls {
  const urls = [] as types.DeputeUrls
  const { url_an, sites_web, nom } = depute
  urls.push({
    label: 'Fiche Assemblée nationale',
    url: url_an,
  })
  // todo: use real wikipedia url
  urls.push({
    label: 'Page wikipedia',
    url: `https://fr.wikipedia.org/wiki/${encodeURIComponent(nom)}`,
  })
  if (sites_web) {
    const unserialized = PHPUnserialize.unserialize(sites_web)
    if (unserialized) {
      const sites = PHPUnserialize.unserialize(sites_web) as {
        [k: string]: string
      }
      urls.push(
        ...Object.values(sites).map(url => {
          const label = url.match(/facebook/)
            ? 'Page facebook'
            : url.match(/twitter/)
            ? `Compte twitter : ${url.replace(/^.*\/(.*)$/, '@$1')}`
            : `Site web : ${url}`
          return {
            label,
            url,
          }
        }),
      )
    }
  }
  return urls
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
  mandats.data->>'dateDebut' AS date_debut,
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

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const slug = context.query.slug as string
  const currentLegislature = 16
  /* 
  champs restants, à faire :
  
  sites_web
  collaborateurs
  mails
  adresses
  top

  const amendements = await queryDeputeAmendementsSummary(baseDepute.id)
  const responsabilites = await queryDeputeResponsabilites(baseDepute.id)
  const votes = await queryDeputeVotes(baseDepute.id, 5)

  
  */

  const depute =
    (
      await sql<{
        uid: string
        full_name: string
        date_of_birth: string
        circo_departement: string
        circo_number: number
      }>`
SELECT
  acteurs.uid AS uid,
  CONCAT(
  	acteurs.data->'etatCivil'->'ident'->>'prenom',
  	' ',
  	acteurs.data->'etatCivil'->'ident'->>'nom'
  ) AS full_name,
  acteurs.data->'etatCivil'->'infoNaissance'->>'dateNais' AS date_of_birth,
  mandats.data->'election'->'lieu'->>'departement' AS circo_departement,
  (mandats.data->'election'->'lieu'->>'numCirco')::int AS circo_number
FROM acteurs
INNER JOIN nosdeputes_deputes
  ON nosdeputes_deputes.uid = acteurs.uid
INNER JOIN mandats
  ON mandats.acteur_uid = acteurs.uid
INNER JOIN organes
  ON organes.uid = ANY(mandats.organes_uids)
WHERE
  organes.data->>'codeType' = 'ASSEMBLEE'
  AND organes.data->>'legislature' = ${currentLegislature}
  AND slug = ${slug}
`.execute(dbReleve)
    ).rows[0] ?? null
  if (!depute) {
    return {
      notFound: true,
    }
  }

  const deputeWithLatestGroup = await addLatestGroupToDepute(depute)

  const mandats_this_legislature = await queryMandatsOfDeputesInLegislature(
    depute.uid,
    currentLegislature,
  )
  const legislatures = await queryLegislatures(depute.uid)

  const returnedDepute: types.Depute = {
    slug,
    mandats_this_legislature,
    legislatures,
    urls: [],
    collaborateurs: [],
    mails: [],
    adresses: [],
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
    top: {
      semaines_presence: { value: 0, rank: 0, max_rank: 0 },
      commission_presences: { value: 0, rank: 0, max_rank: 0 },
      commission_interventions: { value: 0, rank: 0, max_rank: 0 },
      hemicycle_presences: { value: 0, rank: 0, max_rank: 0 },
      hemicycle_interventions: { value: 0, rank: 0, max_rank: 0 },
      hemicycle_interventions_courtes: { value: 0, rank: 0, max_rank: 0 },
      amendements_proposes: { value: 0, rank: 0, max_rank: 0 },
      amendements_signes: { value: 0, rank: 0, max_rank: 0 },
      amendements_adoptes: { value: 0, rank: 0, max_rank: 0 },
      rapports: { value: 0, rank: 0, max_rank: 0 },
      propositions_ecrites: { value: 0, rank: 0, max_rank: 0 },
      propositions_signees: { value: 0, rank: 0, max_rank: 0 },
      questions_ecrites: { value: 0, rank: 0, max_rank: 0 },
      questions_orales: { value: 0, rank: 0, max_rank: 0 },
    },
    votes: [],
    ...deputeWithLatestGroup,
  }

  return {
    props: {
      data: {
        currentLegislature,
        depute: returnedDepute,
      },
    },
  }
}
