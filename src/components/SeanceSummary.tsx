import { capitalizeFirst } from '../lib/utils'
import { SeanceSummary } from '../lib/seanceSummary'

type Props = {
  seanceSummary: SeanceSummary
}

export function SeanceSummary({ seanceSummary }: Props) {
  return (
    <ul>
      {seanceSummary.sections.map(section => (
        <>
          <li key={section.id + '_title'}>{capitalizeFirst(section.titre)}</li>
          <ul key={section.id + '_subsections'} style={{ marginLeft: '30px' }}>
            {section.subSections.map(subsection => (
              <li key={subsection.id}>{capitalizeFirst(subsection.titre)}</li>
            ))}
          </ul>
        </>
      ))}
    </ul>
  )
}
