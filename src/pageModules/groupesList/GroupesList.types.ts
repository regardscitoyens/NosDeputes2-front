export type Props = {
  groupes: Group[]
}
type Group = {
  id: number
  nom: string
  acronym: string
  deputesCount: number
  deputesShareOfTotal: number
}
