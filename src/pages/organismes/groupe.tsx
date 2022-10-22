import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { GrapheRepartitionGroupes } from '../../components/GrapheRepartitionGroupes'
import { fetchGroupList } from '../../logic/deputesAndGroupesService'
import {
  getColorForGroupeAcronym,
  sortGroupes,
} from '../../logic/hardcodedData'
import { GroupeData } from '../../logic/rearrangeData'

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
      <h1 className="text-center text-2xl">List des groupes politiques</h1>
      <table className="w-full bg-slate-100  text-slate-500">
        <tr>
          <th>Intitulé</th>
          <th>Membres</th>
        </tr>
        {groupes.map(g => (
          <tr key={g.id}>
            <td className="py-2">
              <Link href={`/groupe/${g.acronym}`}>
                <a>
                  <span
                    className={`mx-2 inline-block py-1 px-2 text-white`}
                    style={{ background: getColorForGroupeAcronym(g.acronym) }}
                  >
                    {g.acronym}
                  </span>
                  {g.nom}
                </a>
              </Link>
            </td>
            <td className="text-center">{g.deputesCount}</td>
          </tr>
        ))}
      </table>
      <GrapheRepartitionGroupes groupesData={groupes} />
    </div>
  )
}
