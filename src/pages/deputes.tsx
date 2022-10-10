import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { DeputeItem } from '../components/DeputeItem'
import { GrapheRepartitionGroupes } from '../components/GrapheRepartitionGroupes'
import { Todo } from '../components/Todo'
import { DeputeWithGroupe, fetchDeputesWithGroupe } from '../logic/api'
import { buildGroupesData, GroupeData } from '../logic/rearrangeData'
import { CURRENT_LEGISLATURE } from '../logic/hardcodedData'

type Data = {
  deputes: DeputeWithGroupe[]
  groupesData: GroupeData[]
}

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context,
) => {
  const deputes = (await fetchDeputesWithGroupe()).sort((a, b) =>
    a.nom.localeCompare(b.nom),
  )
  return {
    props: {
      data: {
        deputes,
        groupesData: buildGroupesData(deputes),
      },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { deputes, groupesData } = data
  const deputesEnCoursMandat = deputes.filter((_) => !_.fin_mandat)
  return (
    <div>
      <h1 className="text-2xl">Tous les députés par ordre alphabétique</h1>
      <p>
        Retrouvez ici l'ensemble des {deputes.length} députés de la{' '}
        {CURRENT_LEGISLATURE}ème législature (dont {deputesEnCoursMandat.length}{' '}
        en cours de mandat). Les informations relatives aux députés des
        précédentes législatures restent accessibles sur les liens suivants :
        <Todo inline>liens vers les autres législatures</Todo>
      </p>
      <GrapheRepartitionGroupes {...{ groupesData }} />
      <ul className="list-none">
        {data.deputes.map((depute) => {
          return (
            <li key={depute.id}>
              <DeputeItem {...{ depute }} withCirco />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
