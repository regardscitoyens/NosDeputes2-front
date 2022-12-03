import { sql } from 'kysely'
import { GetServerSideProps } from 'next'
import { dbLegacy } from '../../lib/dbLegacy'
import * as types from './DossierListByInterventions.types'

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const sections = (await dbLegacy
    .selectFrom('section')
    .where('id', '=', sql`section_id`)
    .orderBy('nb_interventions', 'desc')
    .select('id')
    .select('titre_complet')
    .select('nb_interventions')
    .execute()) as types.Section[]

  return {
    props: {
      data: {
        sections,
      },
    },
  }
}
