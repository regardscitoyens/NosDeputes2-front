import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { DeputeItem } from '../../components/DeputeItem'
import { GrapheRepartitionGroupes } from '../../components/GrapheRepartitionGroupes'
import { Todo } from '../../components/Todo'
import { fetchDeputesWithGroupe } from '../../logic/apiDeputes'
import {
  getAllDeputesFromCurrentLegislature,
  SimpleDepute,
} from '../../logic/deputesService'
import { CURRENT_LEGISLATURE } from '../../logic/hardcodedData'
import { buildGroupesData, GroupeData } from '../../logic/rearrangeData'

type Data = {
  deputes: SimpleDepute[]
  groupesData: GroupeData[]
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const deputesOld = (await fetchDeputesWithGroupe()).sort((a, b) =>
    a.nom.localeCompare(b.nom),
  )
  const deputes = await getAllDeputesFromCurrentLegislature()
  return {
    props: {
      data: {
        deputes,
        groupesData: buildGroupesData(deputesOld),
      },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { deputes, groupesData } = data
  const deputesEnCoursMandat = deputes.filter(_ => _.mandatOngoing)
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
        {data.deputes.map(depute => {
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
