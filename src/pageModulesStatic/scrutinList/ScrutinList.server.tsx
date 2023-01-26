import { sql } from 'kysely'
import { GetStaticPaths, GetStaticProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import { FIRST_LEGISLATURE_FOR_SCRUTINS } from '../../lib/hardcodedData'
import {
  buildLegislaturesNavigationUrls,
  buildStaticPaths,
  readLegislatureFromContext,
} from '../../lib/routingUtils'
import * as types from './ScrutinList.types'

const basePath = '/scrutins'
const firstLegislature = FIRST_LEGISLATURE_FOR_SCRUTINS

export const getStaticPaths: GetStaticPaths<types.Params> = () => {
  return buildStaticPaths(firstLegislature)
}

export const getStaticProps: GetStaticProps<
  types.Props,
  types.Params
> = async context => {
  const legislature = readLegislatureFromContext(context)
  const legislatureNavigationUrls = buildLegislaturesNavigationUrls(
    firstLegislature,
    basePath,
  )

  const scrutins = (
    await sql<types.Scrutin>`
SELECT 
  uid,
  data->>'titre' AS title,
  (data->>'numero')::int AS numero,
  data->>'seanceRef' AS seance_ref,
  data->'sort'->>'code' AS sort,
  data->'typeVote' AS type_vote,
  data->'demandeur'->>'texte' AS demandeur_texte,
  data->>'dateScrutin' AS date_scrutin,
  data->>'modePublicationDesVotes' AS mode_publication_des_votes,
  data->'syntheseVote' AS synthese_vote
FROM scrutins
WHERE 
  data->>'legislature' = ${legislature.toString()}
ORDER BY date_scrutin ASC, numero ASC
  `.execute(dbReleve)
  ).rows

  return {
    props: {
      legislature,
      legislatureNavigationUrls,
      scrutins,
    },
  }
}
