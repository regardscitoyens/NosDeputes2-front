import fetch from 'node-fetch'

// l'api Postgres
const apiBase = 'http://localhost:4001'

export type Depute = {
  id: number
  nom: string
  nom_de_famille: string
  sexe: 'H' | 'F'
  date_naissance: string
  lieu_naissance: string
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

export type Groupe = {
  id: number
  nom: string
  slug: string
  acronym: string
}

export type DeputeWithGroupe = Depute & {
  groupe: Groupe | null
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

export async function fetchDeputeBySlug(slug: string): Promise<Depute | null> {
  const res = (await fetchJson(`/parlementaire?slug=eq.${slug}`)) as Depute[]
  if (res.length) {
    return res[0]
  }
  return null
}

export async function fetchDeputesWithGroupe(): Promise<DeputeWithGroupe[]> {
  // join parlementaire -> parlementaire_organisme -> organisme
  // Keep only the "groupe" and the ones still ongoing (fin_fonction NULL)
  const url = `/parlementaire?select=*,parlementaire_organisme(organisme_id,parlementaire_groupe_acronyme,fin_fonction,organisme(id,%20nom,%20type,%20slug)))&parlementaire_organisme.organisme.type=eq.groupe&parlementaire_organisme.fin_fonction=is.null`
  type QueryResult = (Depute & {
    parlementaire_organisme: {
      organisme_id: string
      parlementaire_groupe_acronyme: string
      fin_fonction: null
      organisme: {
        id: number
        nom: string
        type: 'groupe'
        slug: string
      } | null
    }[]
  })[]
  const rawResult = (await fetchJson(url)) as QueryResult

  return rawResult.map((deputeWithJoinedData) => {
    const { parlementaire_organisme, ...restOfDepute } = deputeWithJoinedData
    let groupe: {
      id: number
      nom: string
      slug: string
      acronym: string
    } | null = null
    parlementaire_organisme.forEach((_) => {
      if (_.organisme !== null) {
        groupe = {
          id: _.organisme.id,
          nom: _.organisme.nom,
          slug: _.organisme.slug,
          acronym: _.parlementaire_groupe_acronyme,
        }
      }
    })
    return {
      ...restOfDepute,
      groupe,
    }
  })
}

// http://localhost:4001/parlementaire?select=*,parlementaire_organisme(organisme_id,parlementaire_groupe_acronyme,fin_fonction,organisme(id,%20nom,%20type,%20slug)))&parlementaire_organisme.organisme.type=eq.groupe&parlementaire_organisme.fin_fonction=is.null

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
