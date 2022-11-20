import { TexteLoiTable } from '../../lib/db'

export type Props = {
  texteLoi: TexteLoi
  auteurs: Author[]
}

export type TexteLoi = {
  id: string
  numero: number
  date: string
  titre: string
  type: TexteLoiTable['type']
  type_details: string | null
  subDocumentDetails: SubDocumentDetails | null
}

export type SubDocumentDetails = {
  tomeNumber: number
  annexeNumber: number | null
}

export type Author = {
  id: number
  nom: string
}
