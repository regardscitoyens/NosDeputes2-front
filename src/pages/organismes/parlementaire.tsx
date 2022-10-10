import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Todo } from '../../components/Todo'
import { fetchDeputesWithOtherOrganismes } from '../../logic/api'
import {
  buildOrganismeData as buildOrganismesData,
  OrganismeData,
} from '../../logic/rearrangeData'

type Data = { organismes: OrganismeData[] }

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context,
) => {
  const deputes = await fetchDeputesWithOtherOrganismes()
  const organismes = buildOrganismesData(deputes)
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
    <div>
      <Todo inline>Trier cette table avec un ordre d'importance </Todo>
      <Todo inline>Afficher si ce sont des commissions permanentes </Todo>
      <Todo inline>
        Sortir les missions extra parlementaires, comprendre comment les filtrer
      </Todo>
      <table>
        <tr>
          <th>Nom</th>
          <th>Membres</th>
          <th>Réunions publiques</th>
        </tr>
        {organismes.map((o) => (
          <tr key={o.id}>
            <td>{o.nom}</td>
            <td>{o.deputesCount}</td>
            <td>
              <Todo inline>?</Todo>
            </td>
          </tr>
        ))}
      </table>
    </div>
  )
}
