import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Todo } from '../../components/Todo'
import {
  OrganismeWithDeputesCount,
  queryOrganismsWithDeputesCount,
} from '../../repositories/deputesAndOrganismesRepository'

type Data = { organismes: OrganismeWithDeputesCount[] }

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const organismes = await queryOrganismsWithDeputesCount('parlementaire')
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
      <Todo inline>Faire le lien vers la fiche pour chacun d'entre eux </Todo>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Membres</th>
            <th>Réunions publiques</th>
          </tr>
        </thead>
        <tbody>
          {organismes.map(o => (
            <tr key={o.id}>
              <td>{o.nom}</td>
              <td>{o.deputesCount}</td>
              <td>
                <Todo inline>?</Todo>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
