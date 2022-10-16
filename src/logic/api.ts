import fetch from 'node-fetch'
import { notNull } from './utils'

// l'api Postgres
const apiBase = 'http://localhost:4001'

type RawFonctionFromApi =
  | 'présidente'
  | 'apparentée'
  | 'président'
  | 'apparenté'
  | 'membre'

export type NormalizedFonction = 'president' | 'membre' | 'apparente'

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

export type Organisme = {
  id: number
  nom: string
  slug: string
}

export type GroupeForDepute = Groupe & {
  fonction: NormalizedFonction
}
export type OrganismeForDepute = Organisme & {
  fonction: string
}

export type DeputeWithGroupe = Depute & {
  groupe: GroupeForDepute | null
}

export type DeputeWithOrganismes = Depute & {
  organismes: OrganismeForDepute[]
}

export async function fetchDeputes(): Promise<Depute[]> {
  return await fetchJson(`/parlementaire`)
}

export async function fetchDeputeBySlug(
  slug: string,
): Promise<DeputeWithGroupe | null> {
  return (await fetchDeputesWithGroupe()).find((_) => _.slug == slug) ?? null
}

export async function fetchDeputesWithGroupe(): Promise<DeputeWithGroupe[]> {
  // join parlementaire -> parlementaire_organisme -> organisme
  // Keep only the "groupe" and the ones still ongoing (fin_fonction NULL)
  const url = `/parlementaire?select=*,parlementaire_organisme(organisme_id,parlementaire_groupe_acronyme,fonction,fin_fonction,organisme(id,%20nom,%20type,%20slug)))&parlementaire_organisme.organisme.type=eq.groupe&parlementaire_organisme.fin_fonction=is.null`
  type QueryResult = (Depute & {
    parlementaire_organisme: {
      organisme_id: string
      parlementaire_groupe_acronyme: string
      fonction: RawFonctionFromApi
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
    let groupe: GroupeForDepute | null = null
    parlementaire_organisme.forEach((_) => {
      if (_.organisme !== null) {
        groupe = {
          fonction: normalizeFonction(_.fonction),
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

// TODO il faudrait rajouter le groupe actuel, et donc faire une sorte de jointure encore ??
export async function fetchAncienMembresOfGroupe(
  groupeId: number,
): Promise<Depute[]> {
  // Note : cette query doit être faite sur l'id, pas l'acronyme, car la table parlementaire_organisme contient les acronym même quand il ne s'agit pas du groupe
  // TODO attention pour les NI je crois que ça remonte beaucoup trop de monde, comme si tout le monde était passé par les NI à une époque ?
  const url = `/parlementaire_organisme?select=parlementaire(*)))&organisme_id=eq.${groupeId}&fin_fonction=not.is.null`
  type QueryResult = {
    parlementaire: Depute
  }[]
  const rawResult = (await fetchJson(url)) as QueryResult
  return rawResult.map((_) => _.parlementaire)
}

// deputes with their organismes (except groupes parlementaires)
export async function fetchDeputesWithOtherOrganismes(): Promise<
  DeputeWithOrganismes[]
> {
  // Same query as for the groupes, replace just eq.groupe with neq.groupe
  const url = `/parlementaire?select=*,parlementaire_organisme(organisme_id,parlementaire_groupe_acronyme,fonction,fin_fonction,organisme(id,%20nom,%20type,%20slug)))&parlementaire_organisme.organisme.type=neq.groupe&parlementaire_organisme.fin_fonction=is.null`
  type QueryResult = (Depute & {
    parlementaire_organisme: {
      organisme_id: string
      parlementaire_groupe_acronyme: string
      // ici les fonctions sont plus variées, pour l'instant on ne les type pas
      fonction: string
      fin_fonction: null
      organisme: {
        id: number
        nom: string
        type: string
        slug: string
      } | null
    }[]
  })[]
  const rawResult = (await fetchJson(url)) as QueryResult

  return rawResult.map((deputeWithJoinedData) => {
    const { parlementaire_organisme, ...restOfDepute } = deputeWithJoinedData
    const organismes = parlementaire_organisme
      .map((_) => {
        if (_.organisme !== null) {
          return {
            fonction: _.fonction,
            id: _.organisme.id,
            nom: _.organisme.nom,
            slug: _.organisme.slug,
          }
        }
        return null
      })
      .filter(notNull)
    return {
      ...restOfDepute,
      organismes,
    }
  })
}

export async function fetchJson<T>(path: string): Promise<T> {
  const url = `${apiBase}${path}`
  console.log(`>> fetching ${url}`)
  return (await (await fetch(url)).json()) as any as T
}

function normalizeFonction(f: RawFonctionFromApi): NormalizedFonction {
  switch (f) {
    case 'présidente':
    case 'président':
      return 'president'
    case 'apparentée':
    case 'apparenté':
      return 'apparente'
    case 'membre':
      return 'membre'
  }
}
