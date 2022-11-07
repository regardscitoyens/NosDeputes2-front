import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { DeputeItem } from '../../components/DeputeItem'
import { GrapheRepartitionGroupes } from '../../components/GrapheRepartitionGroupes'
import { Todo } from '../../components/Todo'
import { db } from '../../repositories/db'
import {
  addLatestGroupToDeputes,
  WithLatestGroup,
} from '../../services/addLatestGroup'

import { CURRENT_LEGISLATURE, sortGroupes } from '../../services/hardcodedData'
import { buildGroupesData, GroupeData } from '../../services/rearrangeData'

type Data = {
  deputes: LocalDepute[]
  groupesData: GroupeData[]
}

type LocalDepute = WithLatestGroup<{
  id: number
  slug: string
  nom: string
  nom_circo: string
  nom_de_famille: string
  mandatOngoing: boolean
}>

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const deputes = (
    await db
      .selectFrom('parlementaire')
      .select([
        'id',
        'slug',
        'nom',
        'nom_de_famille',
        'nom_circo',
        'fin_mandat',
      ])
      .execute()
  ).map(row => {
    const { fin_mandat, ...rest } = row
    return {
      ...rest,
      mandatOngoing: fin_mandat === null,
    }
  })
  const deputesWithGroup = await addLatestGroupToDeputes(deputes)
  const groupesData = sortGroupes(
    buildGroupesData(deputesWithGroup.filter(_ => _.mandatOngoing)),
  )
  return {
    props: {
      data: {
        deputes: deputesWithGroup,
        groupesData,
      },
    },
  }
}

function prepare3Cols<A>(array: A[]) {
  const len = array.length
  const canSplitEvenly = len % 3 == 0
  const minByCol = Math.floor(len / 3)
  const nbInFirstCols = canSplitEvenly ? minByCol : minByCol + 1
  return [
    array.slice(0, nbInFirstCols),
    array.slice(nbInFirstCols, nbInFirstCols * 2),
    array.slice(nbInFirstCols * 2),
  ]
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { deputes, groupesData } = data
  const deputesEnCoursMandat = deputes.filter(_ => _.mandatOngoing)
  const deputesByLetter = groupBy(deputes, _ => _.nom_de_famille[0])
  // TODO fix le tri alphabétique et le groupement par lettre : attention aux accents
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
      {sortBy(Object.entries(deputesByLetter), _ => _[0]).map(
        ([letter, deputes]) => {
          const deputesCols = prepare3Cols(
            sortBy(deputes, _ => _.nom_de_famille),
          )
          return (
            <div key={letter}>
              <h2 className="my-4 text-center text-4xl">{letter}</h2>
              <div className="flex">
                {deputesCols.map((deputes, idx) => {
                  return (
                    <ul key={idx} className="grow-1 w-1/3">
                      {sortBy(deputes, _ => _.nom_de_famille).map(depute => {
                        return (
                          <li key={depute.id}>
                            <DeputeItem {...{ depute }} withCirco />
                          </li>
                        )
                      })}
                    </ul>
                  )
                })}
              </div>
            </div>
          )
        },
      )}
    </div>
  )
}
