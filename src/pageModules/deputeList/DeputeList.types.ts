import { WithLatestGroupOrNull } from '../../lib/addLatestGroup'
import { GroupeData } from '../../lib/buildGroupesData'

export type Params = {
  legislature?: string
}
export type Props = {
  deputes: Depute[]
  groupesData: GroupeData[]
  legislature: number
  legislatureNavigationUrls: [number, string][]
}
export type Depute = WithLatestGroupOrNull<DeputeSimple>
export type DeputeSimple = {
  uid: string
  slug: string | null
  circo_departement: string
  mandat_ongoing: boolean
  fullName: string
  firstLetterLastName: string
}

export type DeputeRawFromDb = {
  uid: string
  slug: string | null
  first_name: string
  last_name: string
  circo_departement: string
  mandat_ongoing: boolean
}
