import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { DeputeItem } from '../../components/DeputeItem'
import { Todo } from '../../components/Todo'
import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import {
  DeputeInOrganisme,
  FonctionInOrganisme,
  fonctionsWithFeminineVersion,
  OrganismeBasicData,
  queryDeputesForOrganisme,
  queryOrganismeBasicData,
} from '../../repositories/deputesAndOrganismesRepository'
import {
  fetchDeputesList,
  SimpleDepute,
} from '../../services/deputesAndGroupesService'

type DeputeInOrganismeWithGroupe = DeputeInOrganisme & {
  latestGroup: SimpleDepute['latestGroup']
}

type Data = {
  organisme: OrganismeBasicData & {
    deputes: DeputeInOrganismeWithGroupe[]
  }
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const slug = context.query.slug as string
  const organisme = await queryOrganismeBasicData(slug)
  if (!organisme) {
    return {
      notFound: true,
    }
  }
  const deputes = await queryDeputesForOrganisme(slug)
  // On réutilise cette query, qui contient les latestGroup
  // Pas du tout efficace
  // TODO revoir ça, faire des query plus intelligentes. Et paralleliser les query au moins
  const allDeputesWithLatestGroup = await fetchDeputesList()

  function addLatestGroup(deputes: DeputeInOrganisme[]) {
    return deputes.map(depute => {
      const latestGroup = allDeputesWithLatestGroup.find(
        _ => _.id === depute.id,
      )?.latestGroup
      if (!latestGroup) {
        throw new Error(`Didnt find the group of depute ${depute.id}`)
      }
      return {
        ...depute,
        latestGroup,
      }
    })
  }

  return {
    props: {
      data: {
        organisme: {
          ...organisme,
          deputes: addLatestGroup(deputes),
        },
      },
    },
  }
}

function GroupOfDeputes({
  title,
  deputes,
}: {
  title: string
  deputes: DeputeInOrganismeWithGroupe[]
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

const fonctionInDisplayOrder: FonctionInOrganisme[] = [
  'président délégué',
  'président de droit',
  'président',
  'co-président',
  'vice-président',
  'deuxième vice-président',
  'questeur',
  'secrétaire',
  'rapporteur général',
  'rapporteur',
  'co-rapporteur',
  'chargé de mission',
  'membre du bureau',
  'membre avec voix délibérative',
  'membre avec voix consultative',
  'membre de droit',
  'membre titulaire',
  'membre nommé',
  'membre',
  'membre suppléant',
  'apparenté',
]

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { organisme } = data
  const { deputes } = organisme

  const formerDeputes = deputes.filter(_ => !_.currentMember)
  const currentDeputes = deputes.filter(_ => _.currentMember)

  const groupedByFonction = groupBy(currentDeputes, _ => _.fonction) as {
    [fonction in FonctionInOrganisme]: DeputeInOrganismeWithGroupe[]
  }
  const entries = Object.entries(groupedByFonction) as [
    FonctionInOrganisme,
    DeputeInOrganismeWithGroupe[],
  ][]

  const groupedByFonctionAndOrdered = sortBy(entries, _ =>
    fonctionInDisplayOrder.indexOf(_[0]),
  )

  return (
    <div>
      <h1 className="text-center text-2xl">
        {organisme.nom} ({currentDeputes.length} député(s))
      </h1>
      {groupedByFonctionAndOrdered.map(([fonction, deputes]) => {
        if (deputes.length === 0) return null
        const title = fonction + ''
        return <GroupOfDeputes key={fonction} {...{ title, deputes }} />
      })}
      <GroupOfDeputes title="Anciens membres" deputes={formerDeputes} />
    </div>
  )
}
