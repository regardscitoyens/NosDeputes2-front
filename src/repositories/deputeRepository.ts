import { db } from './db'

// The stuff we need to display the depute in a list
export type MinimalDeputeInfo = {
  id: number
  slug: string
  nom: string
  nom_de_famille: string
  nom_circo: string
  mandatOngoing: boolean
}

// All the stuff we need on the depute's page
export type DeputeCompleteInfo = {
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
  sites_web: string | null
  urls?: { label: string; url: string }[]
  url_an: string | null
  collaborateurs: string
  collaborateurs_parsed?: { name: string }[]
  mails: string
  mails_parsed?: string[]
  adresses: string
  adresses_parsed?: string[]
}

export async function queryDeputeForDeputePage(
  slug: string,
): Promise<DeputeCompleteInfo> {
  const row = await db
    .selectFrom('parlementaire')
    .select([
      'slug',
      'nom',
      'nom_circo',
      'num_circo',
      'date_naissance',
      'profession',
      'debut_mandat',
      'fin_mandat',
      'id_an',
      'sexe',
      'sites_web',
      'url_an',
      'collaborateurs',
      'mails',
      'adresses',
    ])
    .where('slug', '=', slug)
    .executeTakeFirst()
  if (!row) {
    throw new Error(`Didn't find depute with slug ${slug}`)
  }
  return {
    ...row,
    date_naissance: row.date_naissance.toISOString(),
    debut_mandat: row.debut_mandat.toISOString(),
    fin_mandat: row.fin_mandat?.toISOString() ?? null,
  }
}
