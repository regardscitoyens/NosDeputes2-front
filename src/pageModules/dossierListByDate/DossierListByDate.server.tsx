import { sql } from 'kysely'
import groupBy from 'lodash/groupBy'
import reverse from 'lodash/reverse'
import sortBy from 'lodash/sortBy'
import { GetServerSideProps } from 'next'
import { dbLegacy } from '../../lib/dbLegacy'
import * as types from './DossierListByDate.types'

function extractMonth(section: types.Section): string {
  // These dates are weirdly formatted
  const [year, month] = section.min_date.split('-')
  return `${month}/${year}`
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const sections: types.Section[] = await dbLegacy
    .selectFrom('section')
    .where('id', '=', sql`section_id`)
    .where('min_date', 'is not', null)
    .where('min_date', '!=', '')
    .orderBy('max_date', 'desc')
    .orderBy('min_date', 'desc')
    .orderBy('timestamp', 'desc')
    .select('id')
    // trick because Kysely doesn't understand that it can't be null
    .select(sql<string>`min_date`.as('min_date'))
    .select('titre_complet')
    .select('nb_interventions')
    .execute()

  const sectionsGrouped = Object.entries(groupBy(sections, extractMonth))
  const sectionGroupedAndSorted = reverse(
    sortBy(sectionsGrouped, ([month]) => month),
  )

  return {
    props: {
      data: {
        sectionsGroupedByMonth: sectionGroupedAndSorted,
      },
    },
  }
}
