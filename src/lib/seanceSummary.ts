import { SeanceSection } from './querySectionsForSeance'
import { uniqBy } from 'lodash'

export type SummarySection = {
  id: number
  titre: string
  // max 1 depth
  subSections: { id: number; titre: string }[]
}

export type SeanceSummary = {
  sections: SummarySection[]
}

export function seanceSummary(sections: SeanceSection[]): SeanceSummary {
  const topLevelSections: SummarySection[] = []
  let currentTopLevelSection: SummarySection | null = null

  for (const section of uniqBy(sections, s => s.id)) {
    if (section.titre !== null) {
      const isTopLevel = !section.titre_complet.includes('>')

      if (isTopLevel) {
        currentTopLevelSection = {
          id: section.id,
          titre: section.titre,
          subSections: [],
        }
        topLevelSections.push(currentTopLevelSection)
      } else if (currentTopLevelSection !== null) {
        currentTopLevelSection.subSections.push({
          titre: section.titre,
          id: section.id,
        })
      }
    }
  }

  return {
    sections: topLevelSections,
  }
}
