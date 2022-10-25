import { sql } from 'kysely'
import groupBy from 'lodash/groupBy'
import reverse from 'lodash/reverse'
import sortBy from 'lodash/sortBy'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { db } from '../../repositories/db'
import { CURRENT_LEGISLATURE } from '../../services/hardcodedData'

type Data = {
  sectionsGroupedByMonth: (readonly [string, LocalSection[]])[]
}

type LocalSection = {
  id: number
  titre_complet: string
  min_date: string
  nb_interventions: number
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const sections = (await db
    .selectFrom('section')
    .where('id', '=', sql`section_id`)
    .where('min_date', 'is not', null)
    .orderBy('max_date', 'desc')
    .orderBy('min_date', 'desc')
    .orderBy('timestamp', 'desc')
    .select('id')
    // trick because Kysely doesn't understand that it can't be null
    .select(sql<string>`min_date`.as('min_date'))
    .select('titre_complet')
    .select('nb_interventions')
    .execute()) as LocalSection[]

  const sectionsGrouped = Object.entries(groupBy(sections, extractMonth))
  const sectionGroupedAndSorted = reverse(
    sortBy(sectionsGrouped, ([month]) => month),
  )

  return {
    props: {
      data: {
        sectionsGroupedByMonth: sectionGroupedAndSorted,
      },
    },
  }
}

function extractMonth(section: LocalSection): string {
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
      <h1 className="text-center text-2xl">Les dossiers parlementaires</h1>
      <h2 className="text-xl">Les derniers dossiers traités à l'Assemblée</h2>
      <ul className="list-none">
        {sectionsGroupedByMonth.map(entry => {
          const [month, sections] = entry
          return (
            <li key={month} className="my-4">
              <h2 className="text-xl font-bold">{month}</h2>
              <ul className="list-none">
                {sections.map(section => {
                  const { id, min_date, titre_complet, nb_interventions } =
                    section
                  return (
                    <li key={id}>
                      <Link href={`/${CURRENT_LEGISLATURE}/dossier/${id}`}>
                        <a className="hover:underline">
                          <span className="text-slate-500">{min_date}</span>{' '}
                          {titre_complet}{' '}
                          {nb_interventions > 0 ? (
                            <span className="italic text-slate-500">
                              {nb_interventions} intervention(s)
                            </span>
                          ) : null}
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
  )
}
