import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Todo } from '../../components/Todo'
import {
  DeputeInOrganisme,
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
    deputes: {
      current: DeputeInOrganismeWithGroupe[]
      former: DeputeInOrganismeWithGroupe[]
    }
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
  const { current, former } = await queryDeputesForOrganisme(slug)
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
          deputes: {
            current: addLatestGroup(current),
            former: addLatestGroup(former),
          },
        },
      },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <Todo>Display the data here</Todo>
}
