import { DeputeWithGroupe, DeputeWithOrganismes } from './api'
import { notNull } from './utils'

export type GroupeData = {
  id: number
  nom: string
  slug: string
  acronym: string
  deputesCount: number
  deputesShareOfTotal: number
}

export function buildGroupesData(deputes: DeputeWithGroupe[]): GroupeData[] {
  const groupesData: GroupeData[] = []
  const groupesFromDeputes = deputes.map((_) => _.groupe).filter(notNull)
  const nbDeputesWithGroupe = groupesFromDeputes.length
  groupesFromDeputes.forEach((groupe) => {
    if (groupe) {
      let groupeData = groupesData.find((_) => _.id === groupe.id)
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
  deputes.forEach((depute) => {
    depute.organismes.forEach((organisme) => {
      let organismeData = organismesData.find((_) => _.id === organisme.id)
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
