import groupBy from 'lodash/groupBy'
import { GetServerSideProps } from 'next'
import { addLatestGroupToDeputes } from '../../lib/addLatestGroup'
import { db } from '../../lib/db'
import { sortGroupes } from '../../lib/hardcodedData'
import * as types from './GroupesList.types'

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const currentDeputesIds = await db
    .selectFrom('parlementaire')
    .where('fin_mandat', 'is', null)
    .select('id')
    .execute()

  const deputesIdsWithLatestGroup = await addLatestGroupToDeputes(
    currentDeputesIds,
  )

  const deputesGrouped = Object.values(
    groupBy(deputesIdsWithLatestGroup, _ => _.latestGroup.id),
  )
  const groupsWithDeputesCount = deputesGrouped.map(deputes => {
    const { fonction, ...restOfGroup } = deputes[0].latestGroup
    return {
      ...restOfGroup,
      deputesCount: deputes.length,
    }
  })
  const totalDeputes = currentDeputesIds.length
  const groups = groupsWithDeputesCount.map(_ => ({
    ..._,
    deputesShareOfTotal: _.deputesCount / totalDeputes,
  }))
  return {
    props: {
      data: {
        groupes: sortGroupes(groups),
      },
    },
  }
}
