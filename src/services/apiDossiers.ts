import fetch from 'node-fetch'
import { notNull } from './utils'

// l'api Postgres
const apiBase = 'http://localhost:4001'

export type Section = {
  id: number
  // there is just the section 1 with a null title, it seems to be just noise
  titre: string | null
  titre_complet: string
  section_id: number
  min_date: string | null
  max_date: string | null
}

export async function fetchSections(): Promise<Section[]> {
  return await fetchJson(`/section`)
}

export async function fetchJson<T>(path: string): Promise<T> {
  const url = `${apiBase}${path}`
  console.log(`>> fetching ${url}`)
  return (await (await fetch(url)).json()) as any as T
}
