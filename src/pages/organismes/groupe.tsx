import groupBy from 'lodash/groupBy'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { GrapheRepartitionGroupes } from '../../components/GrapheRepartitionGroupes'
import { MyLink } from '../../components/MyLink'
import { db } from '../../repositories/db'
import { addLatestGroupToDeputes } from '../../services/addLatestGroup'
import {
  getColorForGroupeAcronym,
  sortGroupes,
} from '../../services/hardcodedData'
import { GroupeData } from '../../services/rearrangeData'

type Data = {
  groupes: LocalGroupe[]
}
type LocalGroupe = {
  id: number
  nom: string
  acronym: string
  deputesCount: number
  deputesShareOfTotal: number
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const currentDeputesIds = await db
    .selectFrom('parlementaire')
    .where('fin_mandat', 'is', null)
    .select('id')
    .execute()

  const deputesIdsWithLatestGroup = await addLatestGroupToDeputes(
    currentDeputesIds,
  )

  const deputesGrouped = Object.values(
    groupBy(deputesIdsWithLatestGroup, _ => _.latestGroup.id),
  )
  const groupsWithDeputesCount = deputesGrouped.map(deputes => {
    const { fonction, ...restOfGroup } = deputes[0].latestGroup
    return {
      ...restOfGroup,
      deputesCount: deputes.length,
    }
  })
  const totalDeputes = currentDeputesIds.length
  const groups = groupsWithDeputesCount.map(_ => ({
    ..._,
    deputesShareOfTotal: _.deputesCount / totalDeputes,
  }))
  return {
    props: {
      data: {
        groupes: sortGroupes(groups),
      },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { groupes } = data
  return (
    <div className="space-y-4">
      <h1 className="text-center text-2xl">Liste des groupes politiques</h1>
      <table className="w-full bg-slate-100  text-slate-500">
        <thead>
          <tr>
            <th>Intitulé</th>
            <th>Membres</th>
          </tr>
        </thead>
        <tbody>
          {groupes.map(g => (
            <tr key={g.id}>
              <td className="py-2">
                <MyLink href={`/groupe/${g.acronym}`}>
                  <span
                    className={`mx-2 inline-block py-1 px-2 text-white`}
                    style={{
                      background: getColorForGroupeAcronym(g.acronym),
                    }}
                  >
                    {g.acronym}
                  </span>
                  {g.nom}
                </MyLink>
              </td>
              <td className="text-center">{g.deputesCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <GrapheRepartitionGroupes groupesData={groupes} />
    </div>
  )
}
