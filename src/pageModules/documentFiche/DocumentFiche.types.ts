export type Props = {
  doc: Document
  auteurs: Author[]
}

export type Document = {
  id: string
  date: Date
}

export type Author = {
  id: number
  nom: string
}
