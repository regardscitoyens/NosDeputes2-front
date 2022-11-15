import { capitalizeFirst } from '../lib/utils'
import { SeanceSummary } from '../lib/seanceSummary'
import { MyLink } from './MyLink'
import { CSSProperties } from 'react'

type Props = {
  seanceSummary: SeanceSummary
  style?: CSSProperties
}

export function SeanceSummary({ seanceSummary, style }: Props) {
  return (
    <ul {...{ style }}>
      {seanceSummary.sections.map(section => (
        <>
          <li key={section.id + '_title'}>
            <MyLink href={`#table_${section.id}`}>
              {capitalizeFirst(section.titre)}
            </MyLink>
          </li>
          <ul key={section.id + '_subsections'} style={{ marginLeft: '30px' }}>
            {section.subSections.map(subsection => (
              <li key={subsection.id}>
                <MyLink href={`#table_${subsection.id}`}>
                  {capitalizeFirst(subsection.titre)}
                </MyLink>
              </li>
            ))}
          </ul>
        </>
      ))}
    </ul>
  )
}
