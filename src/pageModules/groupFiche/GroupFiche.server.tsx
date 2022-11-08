import { GetServerSideProps } from 'next'
import { db } from '../../lib/db'
import {
  DeputesWithAllGroups,
  queryDeputesWithAllGroupes,
} from '../../lib/queryDeputesWithAllGroupes'
import * as types from './GroupFiche.types'

function buildLocalDepute(depute: DeputesWithAllGroups): types.Depute {
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
  current: types.Depute[]
  former: types.Depute[]
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
  data: types.Props
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
