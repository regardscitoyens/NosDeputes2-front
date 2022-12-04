import { GetServerSideProps } from 'next'
import { addLatestGroupToDeputes } from '../../lib/addLatestGroup'
import { dbLegacy } from '../../lib/dbLegacy'
import { queryDeputesForOrganisme } from '../../lib/queryDeputesForOrganisme'
import * as types from './OrganismFiche.types'

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const slug = context.query.slug as string
  const organisme = await dbLegacy
    .selectFrom('organisme')
    .where('slug', '=', slug)
    .select('id')
    .select('nom')
    .executeTakeFirst()
  if (!organisme) {
    return {
      notFound: true,
    }
  }
  const deputes = await queryDeputesForOrganisme(slug)
  const deputesWithLatestGroup = await addLatestGroupToDeputes(deputes)

  return {
    props: {
      data: {
        organisme: {
          ...organisme,
          deputes: deputesWithLatestGroup,
        },
      },
    },
  }
}
