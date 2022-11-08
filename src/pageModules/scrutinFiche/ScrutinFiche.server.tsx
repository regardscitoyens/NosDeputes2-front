import groupBy from 'lodash/groupBy'
import { GetServerSideProps } from 'next'
import { db } from '../../lib/db'
import { parseIntOrNull } from '../../lib/utils'

import * as types from './ScrutinFiche.types'

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const idStr = context.query.id as string
  const id = parseIntOrNull(idStr)
  if (!id) {
    return {
      notFound: true,
    }
  }
  const scrutinRaw = await db
    .selectFrom('scrutin')
    .where('id', '=', id)
    .select([
      'id',
      'type',
      'titre',
      'date',
      'seance_id',
      'nombre_pours',
      'nombre_contres',
      'nombre_abstentions',
      'demandeurs',
      'sort',
    ])
    .executeTakeFirst()

  const interventionMd5 = await db
    .selectFrom('tag')
    .leftJoin('tagging', 'tag.id', 'tagging.tag_id')
    .leftJoin('intervention', 'tagging.taggable_id', 'intervention.id')
    .where('tagging.taggable_model', '=', 'Intervention')
    .where('tag.is_triple', '=', 1)
    .where('tag.triple_namespace', '=', 'scrutin')
    .where('tag.triple_key', '=', 'numero')
    .where('tag.triple_value', '=', id.toString())
    .select('intervention.md5')
    .executeTakeFirst()

  const votes: types.Vote[] = await db
    .selectFrom('parlementaire_scrutin')
    .innerJoin(
      'parlementaire',
      'parlementaire.id',
      'parlementaire_scrutin.parlementaire_id',
    )
    .select([
      'parlementaire_scrutin.id',
      'parlementaire_scrutin.parlementaire_id',
      'parlementaire.nom as parlementaire_nom',
      'parlementaire.slug as parlementaire_slug',
      'parlementaire_scrutin.parlementaire_groupe_acronyme',
      'parlementaire_scrutin.position',
      'parlementaire_scrutin.position_groupe',
      'parlementaire_scrutin.par_delegation',
      'parlementaire_scrutin.delegataire_parlementaire_id',
      'parlementaire_scrutin.mise_au_point_position',
    ])
    .orderBy('position', 'desc')
    .orderBy('nom_de_famille')
    .where('parlementaire_scrutin.scrutin_id', '=', id)
    .execute()

  const votesGrouped: { [acronym: string]: types.Vote[] } = groupBy(
    votes,
    _ => _.parlementaire_groupe_acronyme,
  )

  if (!scrutinRaw) {
    return {
      notFound: true,
    }
  }
  const scrutin = {
    ...scrutinRaw,
    date: scrutinRaw.date.toISOString(),
    interventionMd5: interventionMd5?.md5 ?? null,
    demandeurs: scrutinRaw.demandeurs !== '' ? scrutinRaw.demandeurs : null,
    votesGrouped,
  }
  return {
    props: {
      data: {
        scrutin,
      },
    },
  }
}
