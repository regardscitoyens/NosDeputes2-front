import { WithLatestGroup } from '../../lib/addLatestGroup'
import { GroupeData } from '../../lib/rearrangeData'

export type Props = { deputes: Depute[]; groupesData: GroupeData[] }
export type Depute = WithLatestGroup<{
  id: number
  slug: string
  nom: string
  nom_circo: string
  nom_de_famille: string
  mandatOngoing: boolean
}>
