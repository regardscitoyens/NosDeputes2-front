import fetch from 'node-fetch'

const apiBase = 'http://localhost:4545/v0.1'

export type Depute = {
  id: number
  nom: string
  nom_de_famille: string
  sexe: 'H' | 'F'
  date_naissance: Date
  num_circo: Date
  nom_circo: Date
  sites_web: 'string' | null
  debut_mandat: Date
  fin_mandat: Date | null
  place_hemicycle: number
  url_an: string
  profession: string | null
  id_an: number
  groupe_acronyme: string
  adresses: string
  suppleant_de_id: number | null
  anciens_mandats: string
  mails: string
  collaborateurs: string
  top: string
  villes: string | null
  url_ancien_cpc: string | null
  created_at: Date
  updated_at: Date
  slug: string
}

export async function fetchDeputes(): Promise<Depute[]> {
  return fetchJson(`/parlementaire`)
}

export async function fetchJson<T>(path: string): Promise<T> {
  const url = `${apiBase}${path}`
  console.log(`>> fetching ${url}`)
  return (await (await fetch(url)).json()) as any as T
}
