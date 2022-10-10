import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { GroupeBadge } from '../../components/GroupeBadge'
import { Todo } from '../../components/Todo'
import {
  DeputeWithGroupe,
  fetchDeputesWithGroupe,
  NormalizedFonction,
} from '../../logic/api'
import { buildGroupesData, GroupeData } from '../../logic/buildGroupesData'
import { getColorForGroupeAcronym } from '../../logic/hardcodedData'
import { notNull, uniqBy } from '../../logic/utils'

type Data = {
  groupeData: GroupeData
  deputes: DeputeWithGroupe[]
}

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context,
) => {
  const acronym = context.query.acronym as string
  const deputes = (await fetchDeputesWithGroupe())
    .sort((a, b) => a.nom.localeCompare(b.nom))
    .filter((_) => _.groupe?.acronym === acronym)
  const groupesData = buildGroupesData(deputes)
  if (groupesData.length !== 1) {
    throw new Error(
      `There should be exactly 1 group here, found ${groupesData.length}`,
    )
  }
  const groupeData = groupesData[0]
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
  fonction: NormalizedFonction
}) {
  if (deputes.length === 0) return null
  return (
    <>
      <h2 className="text-2xl">
        {fonction === 'president'
          ? 'Président(e)'
          : fonction === 'apparente'
          ? 'Apparentés'
          : 'Membres'}
      </h2>
      <ul className="list-none">
        {deputes
          .filter((_) => _.groupe?.fonction === fonction)
          .map((depute) => {
            return (
              <li
                key={depute.id}
                className="my-2 rounded-lg bg-slate-100 p-4 text-center drop-shadow md:max-w-fit"
              >
                <Link href={`/${depute.slug}`}>
                  <a>
                    <span className="font-semibold">{depute.nom}</span>{' '}
                    <GroupeBadge groupe={depute.groupe} />
                    <span className="bg-blue text-slate-400">
                      {depute.nom_circo}
                    </span>
                  </a>
                </Link>
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
      <Todo>Afficher aussi les anciens membres</Todo>
    </div>
  )
}
