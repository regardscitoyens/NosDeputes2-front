import { WithLatestComPerm } from '../../lib/addLatestComPerm'
import { WithLatestGroupOrNull } from '../../lib/addLatestGroup'

export type Params = {
  legislature?: string
}
export type Props = {
  deputesWithCom: DeputeWithCom[]
  deputesWithoutCom: DeputeWithoutCom[]
  legislature: number
  legislatureNavigationUrls: [number, string][]
}
export type DeputeWithCom = WithLatestComPerm<
  WithLatestGroupOrNull<DeputeSimple>
>
export type DeputeWithoutCom = WithLatestGroupOrNull<DeputeSimple> & {
  // we add the field just ease the JSX
  latestComPerm: null
}

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
