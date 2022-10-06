import fetch from 'node-fetch'

const apiBase = 'http://localhost:4545/v0.1'

export type Depute = {
  id: number
  nom: string
  nom_de_famille: string
  sexe: 'H' | 'F'
  date_naissance: string
  num_circo: number
  nom_circo: string
  sites_web: 'string' | null
  debut_mandat: string
  fin_mandat: string | null
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
  created_at: string
  updated_at: string
  slug: string
}

export type Organisme = {
  id: number
  nom: string
  type: string
  created_at: string
  updated_at: string
  slug: string
}

export async function fetchDeputes(): Promise<Depute[]> {
  return await fetchJson(`/parlementaire`)
}

export async function fetchDepute(slug: string): Promise<Depute> {
  return await fetchJson(`/parlementaire/${slug}`)
}

export async function fetchOrganismes(): Promise<Organisme[]> {
  return await fetchJson(`/organisme`)
}

export async function fetchOrganisme(id: number): Promise<Organisme> {
  return await fetchJson(`/organisme/${id}`)
}

export async function fetchJson<T>(path: string): Promise<T> {
  const url = `${apiBase}${path}`
  console.log(`>> fetching ${url}`)
  return (await (await fetch(url)).json()) as any as T
}
