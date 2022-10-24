import { Generated, Kysely, MysqlDialect } from 'kysely'
import * as mysql from 'mysql2'
import { readFromEnv } from '../services/utils'

export type DbConnectionPool = Kysely<NosDeputesDatabase>

console.log('Starting DB connection pool')
export const db: DbConnectionPool = new Kysely<NosDeputesDatabase>({
  dialect: new MysqlDialect({
    pool: mysql.createPool({
      host: readFromEnv('DB_HOST'),
      user: readFromEnv('DB_USER'),
      password: readFromEnv('DB_PWD'),
      database: readFromEnv('DB_NAME'),
    }),
  }),
  log: ['query'],
})

interface NosDeputesDatabase {
  parlementaire: ParlementaireTable
  organisme: OrganismeTable
  parlementaire_organisme: ParlementaireOrganismeTable
  seance: SeanceTable
}

interface ParlementaireTable {
  id: Generated<number>
  nom: string
  nom_de_famille: string
  sexe: 'H' | 'F'
  date_naissance: Date
  num_circo: number
  nom_circo: string
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

interface OrganismeTable {
  id: Generated<number>
  nom: string
  type: string
  created_at: Date
  updated_at: Date
  slug: string
}

interface ParlementaireOrganismeTable {
  id: Generated<number>
  organisme_id: number
  parlementaire_id: number
  parlementaire_groupe_acronyme: string
  fonction: string
  importance: number
  debut_fonction: Date
  fin_fonction: Date | null
  created_at: Date
  updated_at: Date
}

interface SeanceTable {
  id: Generated<number>
  nb_commentaires: number
  date: Date
  numero_semaine: number
  annee: number
  type: 'hemicycle' | 'commission'
  moment: string
  organisme_id: number
  tagged: 1 | null
  session: string
  created_at: Date
  updated_at: Date
}
