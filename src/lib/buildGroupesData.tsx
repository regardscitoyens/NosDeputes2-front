import groupBy from 'lodash/groupBy'
import { WithLatestGroup } from './addLatestGroup'

export type GroupeData = {
  nom: string
  acronym: string
  deputesCount: number
  deputesShareOfTotal: number
  color: string
}

export function buildGroupesData(deputes: WithLatestGroup<{}>[]): GroupeData[] {
  type GroupeDataTmp = Omit<GroupeData, 'deputesShareOfTotal'>

  const grouped = Object.values(groupBy(deputes, _ => _.latestGroup.acronym))
  const groupesDataTmp = grouped.map(deputes => {
    const data = deputes.reduce<null | GroupeDataTmp>((acc, depute) => {
      const { nom, acronym, color } = depute.latestGroup
      return {
        nom,
        acronym,
        color,
        deputesCount: acc ? acc.deputesCount + 1 : 1,
      }
    }, null)
    if (data == null) {
      throw new Error('Encountered null after reduce on non empty array')
    }
    return data
  })
  const totalDeputes = groupesDataTmp
    .map(_ => _.deputesCount)
    .reduce((a, b) => a + b, 0)
  const finalGroupesData = groupesDataTmp.map(_ => ({
    ..._,
    deputesShareOfTotal: _.deputesCount / totalDeputes,
  }))
  return finalGroupesData
}
