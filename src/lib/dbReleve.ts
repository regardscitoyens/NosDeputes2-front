import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { Adresses } from '../newPageModules/deputeFiche/DeputeFiche.types'
import { readFromEnv, readIntFromEnv } from './utils'

export type DbConnectionPool = Kysely<ReleveTables>

console.log('Starting releve DB connection pool')
export const dbReleve: DbConnectionPool = new Kysely<ReleveTables>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: readFromEnv('DB_RELEVE_HOST'),
      port: readIntFromEnv('DB_RELEVE_PORT'),
      user: readFromEnv('DB_RELEVE_USER'),
      password: readFromEnv('DB_RELEVE_PWD'),
      database: readFromEnv('DB_RELEVE_NAME'),
    }),
  }),
  log: ['query'],
})

export interface ReleveTables {
  acteurs: {
    uid: string
    data: unknown
    adresses: Adresses
  }
  organes: {
    uid: string
    data: unknown
  }
  mandats: {
    uid: string
    data: unknown
    acteur_uid: string
    organes_uids: string[]
  }
  nosdeputes_deputes: {
    uid: string
    slug: string
  }
  reunions: {
    uid: string
    data: unknown
    legislature: number
    path_in_dataset: string
  }
  sessions: {
    uid: string
    ordinaire: boolean
    legislature: number
    start_date: Date
    end_date: Date
  }
}
