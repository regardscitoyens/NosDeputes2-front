import { WithLatestGroup } from '../../lib/addLatestGroup'

export type Props = { depute: Depute }
export type Depute = WithLatestGroup<{
  id: number
  slug: string
  nom: string
  nom_circo: string
  num_circo: number
  date_naissance: string
  profession: string | null
  debut_mandat: string
  fin_mandat: string | null
  id_an: number
  sexe: 'H' | 'F'
  urls: { label: string; url: string }[]
  collaborateurs: { name: string }[]
  mails: string[]
  adresses: string[]
}>
export type DeputeCollaborateur = { name: string }
export type DeputeUrls = { label: string; url: string }[]
