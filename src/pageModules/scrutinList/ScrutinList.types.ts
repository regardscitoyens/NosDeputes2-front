export type Props = {
  scrutinsOnWhole: Scrutin[]
  othersScrutinsByLaw: { [law: string]: Scrutin[] }
}

export type Scrutin = {
  id: number
  titre: string
  date: string
}
