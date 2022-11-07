import {
  DeputesWithAllGroups,
  FonctionInGroupe,
  queryDeputesWithAllGroupes,
} from './queryDeputesWithAllGroupes'

export type SimpleDepute = {
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

function buildSimpleDepute(depute: DeputesWithAllGroups): SimpleDepute {
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

export async function fetchDeputesOfGroupe(acronym: string): Promise<{
  current: SimpleDepute[]
  former: SimpleDepute[]
}> {
  const deputes = (await queryDeputesWithAllGroupes()).map(
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
