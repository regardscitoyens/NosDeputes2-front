import { sql } from 'kysely'
import groupBy from 'lodash/groupBy'
import reverse from 'lodash/reverse'
import sortBy from 'lodash/sortBy'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { db } from '../../repositories/db'
import { CURRENT_LEGISLATURE } from '../../services/hardcodedData'

type Data = {
  sections: LocalSection[]
}

type LocalSection = {
  id: number
  titre_complet: string
  nb_interventions: number
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const sections = (await db
    .selectFrom('section')
    .where('id', '=', sql`section_id`)
    .orderBy('nb_interventions', 'desc')
    .select('id')
    .select('titre_complet')
    .select('nb_interventions')
    .execute()) as LocalSection[]

  return {
    props: {
      data: {
        sections,
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
  const { sections } = data
  return (
    <div>
      <h1 className=" text-center text-2xl">Les dossiers parlementaires</h1>
      <h2 className="my-6 text-xl">
        Les dossiers les plus discutés à l'Assemblée
      </h2>
      <ul className="list-none">
        {sections.map(section => {
          const { id, titre_complet, nb_interventions } = section
          return (
            <li key={id} className="">
              <Link href={`/${CURRENT_LEGISLATURE}/dossier/${id}`}>
                <a className="hover:underline">
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
    </div>
  )
}
