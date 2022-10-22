import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { DeputeItemOld } from '../../components/DeputeItemOld'
import { Todo } from '../../components/Todo'
import {
  DeputeWithGroupe,
  fetchDeputesWithGroupe,
  NormalizedFonction,
} from '../../logic/apiDeputes'
import { getColorForGroupeAcronym } from '../../logic/hardcodedData'
import { buildGroupesDataOld, GroupeData } from '../../logic/rearrangeData'

type Data = {
  groupeData: GroupeData
  deputes: DeputeWithGroupe[]
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const acronym = context.query.acronym as string
  const deputes = (await fetchDeputesWithGroupe())
    .sort((a, b) => a.nom.localeCompare(b.nom))
    .filter(_ => _.groupe?.acronym === acronym)
  const groupesData = buildGroupesDataOld(deputes)
  if (groupesData.length !== 1) {
    throw new Error(
      `There should be exactly 1 group here, found ${groupesData.length}`,
    )
  }
  const groupeData = groupesData[0]
  // const anciens = await fetchAncienMembresOfGroupe(groupeData.id)
  return {
    props: {
      data: {
        deputes,
        groupeData,
      },
    },
  }
}

export function SameFonctionBlock({
  deputes,
  fonction,
}: {
  deputes: DeputeWithGroupe[]
  fonction: NormalizedFonction | 'anciens'
}) {
  const deputesFiltered = deputes.filter(_ => _.groupe?.fonction === fonction)
  if (deputesFiltered.length === 0) return null
  return (
    <>
      <h2 className="text-2xl">
        {fonction === 'president'
          ? 'Président(e)'
          : fonction === 'apparente'
          ? 'Apparentés'
          : fonction === 'membre'
          ? 'Membres'
          : 'Anciens membres'}
      </h2>
      <ul className="list-none">
        {deputes.map(depute => {
          return (
            <li key={depute.id} className="">
              <DeputeItemOld {...{ depute }} withCirco />
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { deputes, groupeData } = data
  return (
    <div>
      <h1 className="text-center text-2xl">
        Groupe {groupeData.nom}
        <span
          className={`mx-2 inline-block py-1 px-2 text-white`}
          style={{ background: getColorForGroupeAcronym(groupeData.acronym) }}
        >
          {groupeData.acronym}
        </span>
      </h1>
      <SameFonctionBlock fonction={'president'} {...{ deputes }} />
      <SameFonctionBlock fonction={'membre'} {...{ deputes }} />
      <SameFonctionBlock fonction={'apparente'} {...{ deputes }} />
      <Todo>make anciens deputes work</Todo>
      {/* <SameFonctionBlock fonction={'anciens'} deputes={anciens} /> */}
    </div>
  )
}
