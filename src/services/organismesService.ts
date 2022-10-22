import groupBy from 'lodash/groupBy'
import {
  DeputesWithAllGroups,
  getAllDeputesAndGroupesFromCurrentLegislature as queryAllDeputesAndGroupesFromCurrentLegislature,
  FonctionInGroupe,
} from '../repositories/deputesAndGroupesRepository'
import {
  getAllDeputesAndCurrentOrganismesFromCurrentLegislature,
  getAllDeputesAndOrganismesFromCurrentLegislature,
} from '../repositories/deputesAndOrganismesRepository'
import { GroupeData } from './rearrangeData'

export type SimpleDepute = {
  id: number
  nom: string
  nom_de_famille: string
  prenom: string
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

export async function fetchOrganismesParlementaireList(): Promise<
  SimpleDepute[]
> {
  const deputesWithCurrentOrganisms =
    await getAllDeputesAndCurrentOrganismesFromCurrentLegislature(
      'parlementaire',
    )

  // TODO en fait faut refaire une query custom, en groupant par organisme et en comptant le nombre de deputes par organisme

  return deputesWithCurrentOrganisms.map(buildSimpleDepute)
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

export async function fetchDeputesOfGroupe(acronym: string): Promise<{
  current: SimpleDepute[]
  former: SimpleDepute[]
}> {
  const deputes = (await queryAllDeputesAndGroupesFromCurrentLegislature()).map(
    withoutMinorPassageInNonInscrit,
  )
  const current = deputes
    .map(buildSimpleDepute)
    .filter(_ => _.latestGroup.acronym == acronym)
    .filter(_ => _.mandatOngoing)
  const former = deputes
    .filter(_ => _.groupes.some(_ => _.acronym == acronym))
    .map(buildSimpleDepute)
    .filter(_ => _.latestGroup.acronym != acronym || !_.mandatOngoing)
  return { current, former }
}

export async function fetchGroupList(): Promise<GroupeData[]> {
  const deputes = await fetchDeputesList()
  const deputesGrouped = Object.values(
    groupBy(deputes, _ => _.latestGroup.acronym),
  )
  const groupsWithDeputes = deputesGrouped.map(deputes => {
    const { fonction, ...group } = deputes[0].latestGroup
    return {
      ...group,
      deputesCount: deputes.length,
    }
  })
  const totalDeputes = deputes.length
  return groupsWithDeputes.map(_ => ({
    ..._,
    deputesShareOfTotal: _.deputesCount / totalDeputes,
  }))
}
