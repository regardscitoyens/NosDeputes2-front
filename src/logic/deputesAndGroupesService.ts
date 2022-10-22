import { NormalizedFonction } from './apiDeputes'
import { getAllDeputesAndGroupesFromCurrentLegislature } from './repository'

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
    function: NormalizedFonction
    nom: string
    slug: string
  }
}

export async function fetchDeputesList(): Promise<SimpleDepute[]> {
  const deputes = await getAllDeputesAndGroupesFromCurrentLegislature()
  return deputes.map(depute => {
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
  })
}
