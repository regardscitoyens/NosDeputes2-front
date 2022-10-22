import groupBy from 'lodash/groupBy'
import reverse from 'lodash/reverse'
import sortBy from 'lodash/sortBy'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { Todo } from '../../components/Todo'
import { fetchSections, Section } from '../../services/apiDossiers'
import { CURRENT_LEGISLATURE } from '../../services/hardcodedData'

type Data = {
  sectionsGroupedByMonth: (readonly [string, SectionFiltered[]])[]
}

type SectionFiltered = Section & { min_date: string }

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const sections = await fetchSections()
  const sectionsFiltered = sections
    .filter(_ => _.id === _.section_id)
    .filter(_ => _.min_date != null) as SectionFiltered[]
  const sectionsGrouped = Object.entries(
    groupBy(sectionsFiltered, extractMonth),
  )
  const sectionGroupedAndSorted = reverse(
    sortBy(sectionsGrouped, ([month]) => month).map(([month, sections]) => {
      return [month, reverse(sortBy(sections, _ => _.min_date))] as const
    }),
  )

  return {
    props: {
      data: {
        sectionsGroupedByMonth: sectionGroupedAndSorted,
      },
    },
  }
}

function extractMonth(section: SectionFiltered): string {
  // These dates are weirdly formatted
  const [year, month] = section.min_date.split('-')
  return `${month}/${year}`
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { sectionsGroupedByMonth } = data
  return (
    <div>
      <h1 className="text-2xl">Les dossiers parlementaires</h1>
      <div>
        <ul className="list-none">
          {sectionsGroupedByMonth.map(entry => {
            const [month, sections] = entry
            return (
              <li key={month} className="my-4">
                <h2 className="text-xl font-bold">{month}</h2>
                <ul className="list-none">
                  {sections.map(section => {
                    return (
                      <li key={section.id}>
                        <Link
                          href={`${CURRENT_LEGISLATURE}/dossier/${section.id}`}
                        >
                          <a>
                            <span className="text-slate-500">
                              {section.min_date}
                            </span>{' '}
                            {section.titre_complet}
                          </a>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ul>
      </div>
      <Todo>Les dossiers traités à l'assemblée sur les 3 derniers mois</Todo>
    </div>
  )
}
