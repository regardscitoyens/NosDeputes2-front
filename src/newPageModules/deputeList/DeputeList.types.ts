import { WithLatestGroupOrNull } from '../../lib/addLatestGroup'
import { GroupeData } from '../../lib/buildGroupesData'

export type Props = { deputes: Depute[]; groupesData: GroupeData[] }
export type Depute = WithLatestGroupOrNull<{
  id: number
  slug: string
  nom: string
  nom_circo: string
  nom_de_famille: string
  mandatOngoing: boolean
}>
