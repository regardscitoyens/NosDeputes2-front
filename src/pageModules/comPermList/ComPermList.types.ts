import { WithLatestComPermOrNull } from '../../lib/addLatestComPerm'
import { WithLatestGroupOrNull } from '../../lib/addLatestGroup'

export type Props = {
  deputes: Depute[]
  legislature: number
  legislatureNavigationUrls: [number, string][]
}
export type Depute = WithLatestComPermOrNull<
  WithLatestGroupOrNull<DeputeSimple>
>
export type DeputeSimple = {
  uid: string
  slug: string | null
  circo_departement: string
  fullName: string
}

export type DeputeRawFromDb = {
  uid: string
  slug: string | null
  full_name: string
  circo_departement: string
}
