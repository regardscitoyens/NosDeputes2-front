import { TexteLoiTable } from '../../lib/db'

export type Props = {
  document: Document
  auteurs: Author[]
  nbAmendements: number
  subDocuments: SubDocument[]
  documentsRelatifs: DocumentRelatif[]
  section: Section | null
}

export type Document = {
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

export type DocumentRelatif = {
  id: string
  numero: number
  type: TexteLoiTable['type']
  type_details: string | null
}

export type Author = {
  id: number
  nom: string
}

export type Section = {
  id: number
  titre_complet: string
}
