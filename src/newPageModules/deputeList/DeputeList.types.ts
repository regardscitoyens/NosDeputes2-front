import { WithLatestGroupOrNull } from '../../lib/addLatestGroup'
import { GroupeData } from '../../lib/buildGroupesData'

export type Props = {
  deputes: Depute[]
  groupesData: GroupeData[]
}
export type Depute = WithLatestGroupOrNull<DeputeSimple>
export type DeputeSimple = {
  uid: string
  slug: string | null
  fullName: string
  circoDepartement: string
  firstLetterLastName: string
  mandatOngoing: boolean
}
