import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { DeputeItem } from '../../components/DeputeItem'
import { Todo } from '../../components/Todo'
import {
  OrganismeWithCounts,
  queryOrganismsList,
} from '../../repositories/deputesAndOrganismesRepository'
import { isCommissionPermanente } from '../../services/hardcodedData'

type Data = { organismes: OrganismeWithCounts[] }

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const organismes = await queryOrganismsList('groupes')
  return {
    props: {
      data: { organismes },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { organismes } = data

  return (
    <>
      <h1 className="mb-4 text-center text-2xl">
        Liste des groupes d'études et d'amitié
      </h1>
      <table className="w-full">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Membres</th>
          </tr>
        </thead>
        <tbody>
          {organismes.map(organisme => (
            <tr key={organisme.id} className="odd:bg-slate-200">
              <td>
                <Link href={`/organisme/${organisme.slug}`}>
                  <a>{organisme.nom}</a>
                </Link>
              </td>
              <td
                className={
                  organisme.deputesCount == 0 ? 'italic text-slate-400' : ''
                }
              >
                {organisme.deputesCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
