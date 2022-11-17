import { SeanceSection } from './querySectionsForSeance'
import keyBy from 'lodash/keyBy'
import partition from 'lodash/partition'
import uniqBy from 'lodash/uniqBy'

export type SummarySection = {
  id: number
  titre: string
  // max 1 depth
  subSections: { id: number; titre: string }[]
}

export type SeanceSummary = {
  sections: SummarySection[]
}

export function buildSeanceSummary(sections: SeanceSection[]): SeanceSummary {
  const deduplicated = uniqBy(sections, section => section.id)
  const [parentSections, childrenSections] = partition(
    deduplicated,
    section => section.id === section.parent_id,
  )

  const parentSummarySection = parentSections
    .filter(section => section.titre !== null)
    .map<SummarySection>(section => ({
      id: section.id,
      titre: section.titre,
      subSections: [],
    }))
  const parentSummarySectionsByIds = keyBy(
    parentSummarySection,
    section => section.id,
  )

  childrenSections.forEach(children => {
    parentSummarySectionsByIds[children.parent_id.toString()]?.subSections.push(
      {
        id: children.id,
        titre: children.titre,
      },
    )
  })

  return {
    sections: parentSummarySection,
  }
}
