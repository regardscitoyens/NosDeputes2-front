import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { GrapheRepartitionGroupes } from '../../components/GrapheRepartitionGroupes'
import { MyLink } from '../../components/MyLink'
import { fetchGroupList } from '../../services/deputesAndGroupesService'
import {
  getColorForGroupeAcronym,
  sortGroupes,
} from '../../services/hardcodedData'
import { GroupeData } from '../../services/rearrangeData'

type Data = {
  groupes: GroupeData[]
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  return {
    props: {
      data: {
        groupes: sortGroupes(await fetchGroupList()),
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
