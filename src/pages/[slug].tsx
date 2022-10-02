import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Depute, fetchDeputes } from '../api/api'
import { Todo } from '../components/Todo'

type Data = {
  depute: Depute
}

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context,
) => {
  const slug = context.query.slug as string
  const deputes = await fetchDeputes()
  const depute = deputes.find((_) => _.slug == slug)
  if (!depute) {
    return {
      notFound: true,
    }
  }
  const data = { depute }
  return {
    props: { data },
  }
}

export default function Page({
  data: { depute },
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <h1 className="col-span-full  text-center text-2xl">
        <span className="font-bold">{depute.nom}</span>, député{' '}
        <Todo inline>son groupe et sa circonscription</Todo>
      </h1>
      <div className="col-span-2">
        <Todo>photo</Todo>
      </div>
      <div className="col-span-10">
        <Todo>graph de présence et participation</Todo>
      </div>
      <div className="col-span-full">
        <Todo>petite barre "Activité" avec diverses stats</Todo>
      </div>

      <div className="col-span-full grid grid-cols-2 gap-4">
        <div className="space-y-8">
          <Todo>
            Informations générales, mandat, groupe, date de naissance,
            professions, liens twitter etc.
          </Todo>
          <Todo>Adresses email, adresses postale, collaborateurs</Todo>
          <Todo>
            Responsabilités (commissions, missions, groupes extraparlementaires
            etc.)
          </Todo>
          <Todo>
            Travaux législatifs : ses derniers dossiers, interventions,
            amendements (dont stats sur tous ses amendements)
          </Todo>
        </div>
        <div className="space-y-8">
          <Todo>
            "Suivre l'activité du député" par email/rss/widget à embarquer
          </Todo>
          <Todo>Champ lexical (nuage de mots)</Todo>
          <Todo>
            Productions parlementaires (ses derniers rapports/props de lois)
          </Todo>
          <Todo>Votes (ses derniers votes)</Todo>
          <Todo>
            Questions au gouvernement (ses dernieres questions orales, écrites)
          </Todo>
          <Todo>Historique des fonctions et mandats</Todo>
        </div>
      </div>
    </div>
  )
}
