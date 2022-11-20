import { TexteLoiTable } from '../../lib/db'

export type Props = {
  texteLoi: TexteLoi
  auteurs: Author[]
  nbAmendements: number
  subDocuments: SubDocument[]
}

export type TexteLoi = {
  id: string
  numero: number
  date: string
  titre: string
  type: TexteLoiTable['type']
  type_details: string | null
  // if this texte is itself a subdocument
  subDocumentIdentifiers: SubDocumentIdentifiers | null
}

export type SubDocument = {
  id: string
  identifiers: SubDocumentIdentifiers
}

export type SubDocumentIdentifiers = {
  tomeNumber: number
  annexeNumber: number | null
}

export type Author = {
  id: number
  nom: string
}
