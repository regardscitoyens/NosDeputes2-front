import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Todo } from '../../components/Todo'
import {
  OrganismeWithCounts,
  queryOrganismsList,
} from '../../repositories/deputesAndOrganismesRepository'

type Data = { organismes: OrganismeWithCounts[] }

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const organismes = await queryOrganismsList('parlementaire')
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
      <Todo inline>
        Comprendre pourquoi j'ai pas le même tri que sur nosdeputes
      </Todo>
      <Todo inline>Afficher si ce sont des commissions permanentes </Todo>
      <Todo inline>Faire le lien vers la fiche pour chacun d'entre eux </Todo>
      <Todo inline>Tout en bas afficher les "missions terminées" </Todo>
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
            <tr key={o.id} className="odd:bg-slate-200">
              <td>{o.nom}</td>
              <td>{o.deputesCount || ''}</td>
              <td>{o.seancesCount || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
