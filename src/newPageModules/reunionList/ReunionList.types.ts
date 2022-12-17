export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  reunions: Reunion[]
}
export type Reunion = {
  uid: string
  xsi_type: string
}
