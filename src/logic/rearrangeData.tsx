import groupBy from 'lodash/groupBy'
import { DeputeWithGroupe, DeputeWithOrganismes } from './apiDeputes'
import { SimpleDepute } from './deputesService'
import { notNull } from './utils'

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

export function buildGroupesDataOld(deputes: DeputeWithGroupe[]): GroupeData[] {
  const groupesData: GroupeData[] = []
  const groupesFromDeputes = deputes.map(_ => _.groupe).filter(notNull)
  const nbDeputesWithGroupe = groupesFromDeputes.length
  groupesFromDeputes.forEach(groupe => {
    if (groupe) {
      let groupeData = groupesData.find(_ => _.id === groupe.id)
      if (!groupeData) {
        groupeData = {
          ...groupe,
          deputesCount: 0,
          deputesShareOfTotal: 0,
        }
        groupesData.push(groupeData)
      }
      groupeData.deputesCount++
      groupeData.deputesShareOfTotal =
        groupeData.deputesCount / nbDeputesWithGroupe
    }
  })

  return groupesData
}

export type OrganismeData = {
  id: number
  nom: string
  slug: string
  deputesCount: number
}

export function buildOrganismeData(
  deputes: DeputeWithOrganismes[],
): OrganismeData[] {
  const organismesData: OrganismeData[] = []
  deputes.forEach(depute => {
    depute.organismes.forEach(organisme => {
      let organismeData = organismesData.find(_ => _.id === organisme.id)
      if (!organismeData) {
        const { fonction, ...restOfOrganisme } = organisme
        organismeData = {
          ...restOfOrganisme,
          deputesCount: 0,
        }
        organismesData.push(organismeData)
      }
      organismeData.deputesCount++
    })
  })
  return organismesData
}
