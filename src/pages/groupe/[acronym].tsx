import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { DeputeItem } from '../../components/DeputeItem'
import { db } from '../../services/db'
import {
  DeputesWithAllGroups,
  queryDeputesWithAllGroupes,
} from '../../services/queryDeputesWithAllGroupes'
import {
  FonctionInGroupe,
  getColorForGroupeAcronym,
} from '../../services/hardcodedData'

type Data = {
  groupeInfo: {
    nom: string
    acronym: string
  }
  deputes: {
    current: LocalDepute[]
    former: LocalDepute[]
  }
}

export type LocalDepute = {
  id: number
  nom: string
  nom_de_famille: string
  nom_circo: string
  slug: string
  mandatOngoing: boolean
  latestGroup: {
    id: number
    acronym: string
    fonction: FonctionInGroupe
    nom: string
    slug: string
  }
}

function buildLocalDepute(depute: DeputesWithAllGroups): LocalDepute {
  const { groupes, ...restOfDepute } = depute
  if (groupes.length == 0) {
    throw new Error(`Depute ${depute.id} has no groupes`)
  }
  const latestGroup = groupes[groupes.length - 1]
  const { debut_fonction, fin_fonction, ...restOfLatestGroup } = latestGroup
  return {
    ...restOfDepute,
    latestGroup: restOfLatestGroup,
  }
}

function withoutMinorPassageInNonInscrit(
  depute: DeputesWithAllGroups,
): DeputesWithAllGroups {
  return {
    ...depute,
    groupes: depute.groupes.filter(
      ({ acronym, debut_fonction, fin_fonction }) => {
        const isNonInscrit = acronym === 'NI'
        const nbDays =
          debut_fonction &&
          fin_fonction &&
          (fin_fonction.getTime() - debut_fonction.getTime()) /
            (1000 * 3600 * 24)
        // Beaucoup de deputes sont en non inscrit pendant quelques jours en début de législature
        const isMinorPassage = nbDays && nbDays < 7
        return !(isNonInscrit && isMinorPassage)
      },
    ),
  }
}

async function fetchDeputesOfGroupe(acronym: string): Promise<{
  current: LocalDepute[]
  former: LocalDepute[]
}> {
  const deputes = (await queryDeputesWithAllGroupes()).map(
    withoutMinorPassageInNonInscrit,
  )
  const current = deputes
    .map(buildLocalDepute)
    .filter(_ => _.latestGroup.acronym == acronym)
    .filter(_ => _.mandatOngoing)
  const former = deputes
    .filter(_ => _.groupes.some(_ => _.acronym == acronym))
    .map(buildLocalDepute)
    .filter(_ => _.latestGroup.acronym != acronym || !_.mandatOngoing)
  return { current, former }
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const acronym = context.query.acronym as string
  const groupeInfo = await db
    .selectFrom('organisme')
    .innerJoin(
      'parlementaire_organisme',
      'parlementaire_organisme.organisme_id',
      'organisme.id',
    )
    .select(['nom', 'parlementaire_groupe_acronyme as acronym'])
    .where('parlementaire_groupe_acronyme', '=', acronym)
    .where('type', '=', 'groupe')
    .executeTakeFirst()
  if (!groupeInfo) {
    return {
      notFound: true,
    }
  }
  const deputes = await fetchDeputesOfGroupe(acronym)
  return {
    props: {
      data: {
        deputes,
        groupeInfo,
      },
    },
  }
}

function GroupOfDeputes({
  title,
  deputes,
}: {
  title: string
  deputes: LocalDepute[]
}) {
  if (deputes.length === 0) return null
  return (
    <div>
      <h2 className="text-2xl">{title}</h2>
      <ul className="list-none">
        {deputes.map(depute => {
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

const displayRankOfFonctions: Record<FonctionInGroupe, number> = {
  president: 1,
  membre: 2,
  apparente: 3,
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {
    deputes: { current, former },
    groupeInfo: { nom, acronym },
  } = data

  const groupedByFonction = groupBy(current, _ => _.latestGroup.fonction) as {
    [fonction in FonctionInGroupe]: LocalDepute[]
  }
  const entries = Object.entries(groupedByFonction) as [
    FonctionInGroupe,
    LocalDepute[],
  ][]

  const groupedByFonctionAndOrdered = sortBy(
    entries,
    _ => displayRankOfFonctions[_[0]],
  )
  return (
    <div>
      <h1 className="text-center text-2xl">
        Groupe {nom}
        <span
          className={`mx-2 inline-block py-1 px-2 text-white`}
          style={{ background: getColorForGroupeAcronym(acronym) }}
        >
          {acronym}
        </span>
        ({current.length} députés)
      </h1>
      {groupedByFonctionAndOrdered.map(([fonction, deputes]) => {
        if (deputes.length === 0) return null
        const title =
          fonction === 'president'
            ? 'Président(e)'
            : fonction === 'apparente'
            ? 'Apparentés'
            : fonction === 'membre'
            ? 'Membres'
            : fonction
        return <GroupOfDeputes key={fonction} {...{ title, deputes }} />
      })}
      <GroupOfDeputes title="Anciens membres" deputes={former} />
    </div>
  )
}
