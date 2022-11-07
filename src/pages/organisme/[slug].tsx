import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { DeputeItem } from '../../components/DeputeItem'
import { db } from '../../repositories/db'
import { FonctionInGroupe } from '../../services/queryDeputesWithAllGroupes'
import { queryDeputesForOrganisme } from '../../services/queryDeputesForOrganisme'
import { addLatestGroupToDeputes } from '../../services/addLatestGroup'
import { FonctionInOrganisme } from '../../services/hardcodedData'

type Data = {
  organisme: LocalOrganisme
}

type LocalOrganisme = {
  id: number
  nom: string
  deputes: LocalDepute[]
}
type LocalDepute = {
  id: number
  slug: string
  nom: string
  nom_de_famille: string
  nom_circo: string
  mandatOngoing: boolean
  latestGroup: {
    acronym: string
    fonction: FonctionInGroupe
  }
  fonction: FonctionInOrganisme
  currentMember: boolean
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const slug = context.query.slug as string
  const organisme = await db
    .selectFrom('organisme')
    .where('slug', '=', slug)
    .select('id')
    .select('nom')
    .executeTakeFirst()
  if (!organisme) {
    return {
      notFound: true,
    }
  }
  const deputes = await queryDeputesForOrganisme(slug)
  const deputesWithLatestGroup = await addLatestGroupToDeputes(deputes)

  return {
    props: {
      data: {
        organisme: {
          ...organisme,
          deputes: deputesWithLatestGroup,
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
    [fonction in FonctionInOrganisme]: LocalDepute[]
  }
  const entries = Object.entries(groupedByFonction) as [
    FonctionInOrganisme,
    LocalDepute[],
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
