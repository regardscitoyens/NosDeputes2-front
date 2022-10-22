import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { DeputeItemOld } from '../../components/DeputeItemOld'
import { Todo } from '../../components/Todo'
import groupBy from 'lodash/groupBy'
import {
  DeputeWithGroupe,
  fetchDeputesWithGroupe,
  NormalizedFonction,
} from '../../logic/apiDeputes'
import {
  fetchDeputesOfGroupe,
  SimpleDepute,
} from '../../logic/deputesAndGroupesService'
import { getColorForGroupeAcronym } from '../../logic/hardcodedData'
import {
  buildGroupesData,
  buildGroupesDataOld,
  GroupeData,
} from '../../logic/rearrangeData'
import { DeputeItem } from '../../components/DeputeItem'

type Data = {
  groupeData: GroupeData
  deputes: {
    current: SimpleDepute[]
    former: SimpleDepute[]
  }
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const acronym = context.query.acronym as string
  const deputes = await fetchDeputesOfGroupe(acronym)
  // const groupesData = buildGroupesData(deputes)
  // if (groupesData.length !== 1) {
  //   throw new Error(
  //     `There should be exactly 1 group here, found ${groupesData.length}`,
  //   )
  // }
  // const groupeData = groupesData[0]
  // const anciens = await fetchAncienMembresOfGroupe(groupeData.id)
  return {
    props: {
      data: {
        deputes,
        groupeData: {} as any, // TODO make it work
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
  const {
    deputes: { current, former },
    groupeData,
  } = data
  const currentByFunction = groupBy(current, _ => _.latestGroup.fonction)
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
      {Object.entries(currentByFunction).map(([fonction, deputes]) => {
        if (deputes.length === 0) return null
        return (
          <>
            <h2 className="text-2xl">
              {fonction === 'president'
                ? 'Président(e)'
                : fonction === 'apparente'
                ? 'Apparentés'
                : fonction === 'membre'
                ? 'Membres'
                : fonction}
            </h2>
            <ul className="list-none">
              {deputes.map(depute => {
                return (
                  <li key={depute.id}>
                    <DeputeItem {...{ depute }} withCirco />
                  </li>
                )
              })}
            </ul>
          </>
        )
      })}
      <>
        <h2 className="text-2xl">Anciens membres</h2>
        <ul className="list-none">
          {former.map(depute => {
            return (
              <li key={depute.id}>
                <DeputeItem {...{ depute }} withCirco />
              </li>
            )
          })}
        </ul>
      </>
    </div>
  )
}
