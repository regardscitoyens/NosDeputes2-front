import { sql } from 'kysely'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { MyLink } from '../../components/MyLink'
import { db } from '../../services/db'
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
              <MyLink href={`/${CURRENT_LEGISLATURE}/dossier/${id}`}>
                {titre_complet}{' '}
                {nb_interventions > 0 ? (
                  <span className="italic text-slate-500">
                    {nb_interventions} intervention(s)
                  </span>
                ) : null}
              </MyLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
