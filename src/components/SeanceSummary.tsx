import { capitalizeFirst } from '../lib/utils'
import { SeanceSummary } from '../lib/seanceSummary'
import { MyLink } from './MyLink'

type Props = {
  seanceSummary: SeanceSummary
}

export function SeanceSummary({ seanceSummary }: Props) {
  return (
    <ul className="ml-10">
      {seanceSummary.sections.map(section => (
        <>
          <li key={section.id + '_title'}>
            <MyLink href={`#table_${section.id}`}>
              {capitalizeFirst(section.titre)}
            </MyLink>
          </li>
          <ul key={section.id + '_subsections'} className="ml-10">
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
