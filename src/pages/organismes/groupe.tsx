import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { GrapheRepartitionGroupes } from '../../components/GrapheRepartitionGroupes'
import { fetchDeputesWithGroupe } from '../../logic/api'
import { buildGroupesData, GroupeData } from '../../logic/rearrangeData'
import { getColorForGroupeAcronym } from '../../logic/hardcodedData'

type Data = {
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
        groupesData: buildGroupesData(deputes),
      },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { groupesData } = data
  return (
    <div className="space-y-4">
      <h1 className="text-center text-2xl">List des groupes politiques</h1>
      <table className="w-full bg-slate-100  text-slate-500">
        <tr>
          <th>Intitulé</th>
          <th>Membres</th>
        </tr>
        {groupesData.map((g) => (
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
      <GrapheRepartitionGroupes {...{ groupesData }} />
    </div>
  )
}
