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
}

export type Author = {
  id: number
  nom: string
}
