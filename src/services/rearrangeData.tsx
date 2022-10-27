import groupBy from 'lodash/groupBy'
import { SimpleDepute } from './deputesAndGroupesService'

export type GroupeData = {
  id: number
  nom: string
  slug: string
  acronym: string
  deputesCount: number
  deputesShareOfTotal: number
}

export function buildGroupesData(deputes: SimpleDepute[]): GroupeData[] {
  type GroupeDataTmp = Omit<GroupeData, 'deputesShareOfTotal'>

  const deputesWithGroupsNotNull = deputes.filter(
    (_): _ is SimpleDepute & { latestGroup: {} } => !!_.latestGroup,
  )

  const grouped = Object.values(
    groupBy(deputesWithGroupsNotNull, _ => _.latestGroup.id),
  )
  const groupesDataTmp = grouped.map(deputes => {
    const data = deputes.reduce<null | GroupeDataTmp>((acc, depute) => {
      const { id, nom, slug, acronym } = depute.latestGroup
      return {
        id,
        nom,
        slug,
        acronym,
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

export type OrganismeData = {
  id: number
  nom: string
  slug: string
  deputesCount: number
}
