import { GetServerSideProps } from 'next'
import { addLatestGroupToDeputes } from '../../lib/addLatestGroup'
import { db } from '../../lib/db'
import { sortGroupes } from '../../lib/hardcodedData'
import { buildGroupesData } from '../../lib/rearrangeData'
import * as PageTypes from './DeputeList.types'

export const getServerSideProps: GetServerSideProps<{
  data: PageTypes.Props
}> = async context => {
  const deputes = (
    await db
      .selectFrom('parlementaire')
      .select([
        'id',
        'slug',
        'nom',
        'nom_de_famille',
        'nom_circo',
        'fin_mandat',
      ])
      .execute()
  ).map(row => {
    const { fin_mandat, ...rest } = row
    return {
      ...rest,
      mandatOngoing: fin_mandat === null,
    }
  })
  const deputesWithGroup = await addLatestGroupToDeputes(deputes)
  const groupesData = sortGroupes(
    buildGroupesData(deputesWithGroup.filter(_ => _.mandatOngoing)),
  )
  return {
    props: {
      data: {
        deputes: deputesWithGroup,
        groupesData,
      },
    },
  }
}