import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { Todo } from '../../components/Todo'
import { CURRENT_LEGISLATURE } from '../../logic/constants'

type Data = {
  recentDossiers: {
    id: number
    nom: string
    date: string
    nbInterventions?: number
  }[]
  legislatureNumber: number
}

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context,
) => {
  return {
    props: {
      data: {
        recentDossiers: [
          {
            id: 312,
            nom: 'Clôture de la session extraordinaire',
            date: '2022-08-04T00:00:00.000',
          },
          {
            id: 302,
            nom: 'Partenariat france-qatar relatif à la sécurité de la coupe du monde de football de 2022',
            nbInterventions: 137,
            date: '2022-08-04T00:00:00.000',
          },
          {
            id: 134,
            nom: 'Projet de loi de finances rectificative pour 2022',
            nbInterventions: 2878,
            date: '2022-08-04T00:00:00.000',
          },
        ],
        legislatureNumber: CURRENT_LEGISLATURE,
      },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { recentDossiers, legislatureNumber } = data
  return (
    <div>
      <h1 className="text-2xl">Les dossiers parlementaires</h1>

      <div>
        <ul className="list-none">
          {recentDossiers.map((dossier) => {
            return (
              <li key={dossier.id}>
                <Link href={`/${legislatureNumber}/dossier/${dossier.id}`}>
                  <a>{dossier.nom}</a>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
      <Todo>Les dossiers traités à l'assemblée sur les 3 derniers mois</Todo>
    </div>
  )
}
