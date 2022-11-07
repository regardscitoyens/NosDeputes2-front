import { Generated, Kysely, MysqlDialect } from 'kysely'
import * as mysql from 'mysql2'
import { readFromEnv, readIntFromEnv } from './utils'

export type DbConnectionPool = Kysely<NosDeputesDatabase>

console.log('Starting DB connection pool')
export const db: DbConnectionPool = new Kysely<NosDeputesDatabase>({
  dialect: new MysqlDialect({
    pool: mysql.createPool({
      host: readFromEnv('DB_HOST'),
      port: readIntFromEnv('DB_PORT'),
      user: readFromEnv('DB_USER'),
      password: readFromEnv('DB_PWD'),
      database: readFromEnv('DB_NAME'),
    }),
  }),
  log: ['query'],
})

export interface NosDeputesDatabase {
  parlementaire: ParlementaireTable
  organisme: OrganismeTable
  parlementaire_organisme: ParlementaireOrganismeTable
  seance: SeanceTable
  section: SectionTable
  scrutin: ScrutinTable
  intervention: InterventionTable
  tagging: TaggingTable
  tag: TagTable
  parlementaire_scrutin: ParlementaireScrutinTable
  variable_globale: VariableGlobaleTable
  texteloi: TexteLoiTable
}

interface ParlementaireTable {
  id: Generated<number>
  nom: string
  nom_de_famille: string
  sexe: 'H' | 'F'
  date_naissance: Date
  num_circo: number
  nom_circo: string
  sites_web: string | null
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

interface SectionTable {
  id: Generated<number>
  nb_commentaires: number
  md5: string
  // there is just the section 1 with a null title, it seems to be just noise
  titre: string | null
  titre_complet: string
  section_id: number
  min_date: string | null
  max_date: Date | null
  timestamp: number
  nb_interventions: number
  id_dossier_an: string | null
  created_at: Date
  updated_at: Date
}

interface ScrutinTable {
  id: Generated<number>
  numero: number
  annee: number
  numero_semaine: number
  date: Date
  // appears to be some null sometimes, not at all times
  // I think it's when the data is in a incomplete state
  seance_id: number | null
  nombre_votants: number
  nombre_pours: number
  nombre_contres: number
  nombre_abstentions: number
  type: 'solennel' | 'ordinaire'
  sort: 'rejeté' | 'adopté'
  titre: string
  texteloi_id: number
  amendement_id: number
  sujet: string
  demandeurs: string
  demandeurs_groupes_acronymes: string
  avis_gouvernement: string
  avis_rapporteur: string
  created_at: Date
  updated_at: Date
}

interface InterventionTable {
  id: Generated<number>
  nb_commentaires: number | null
  nb_mots: number
  md5: string
  intervention: string
  timestamp: number
  source: string
  seance_id: number
  section_id: number | null
  type: 'loi' | 'commission' | 'question'
  date: Date
  personnalite_id: number | null
  parlementaire_id: number | null
  parlementaire_groupe_acronyme: string | null
  fonction: string | null
  created_at: Date
  updated_at: Date
}
interface TaggingTable {
  id: Generated<number>
  tag_id: number
  taggable_model: 'Amendement' | 'Intervention' | 'Section'
  taggable_id: number
}
interface TagTable {
  id: Generated<number>
  name: string
  is_triple: 1 | 0
  triple_namespace: 'loi' | 'scrutin' | null
  triple_key: 'amendement' | 'numero' | null
  triple_value: string | null
}

interface ParlementaireScrutinTable {
  id: number
  scrutin_id: number
  parlementaire_id: number
  parlementaire_groupe_acronyme: string | null
  position: 'pour' | 'nonVotant' | 'abstention' | 'contre' | null
  position_groupe: string
  par_delegation: 1 | 0
  delegataire_parlementaire_id: number
  mise_au_point_position:
    | 'pour'
    | 'nonVotant'
    | 'abstention'
    | 'contre'
    | null
    | 'nonVotantVolontaire'
  created_at: Date
  updated_at: Date
}

interface VariableGlobaleTable {
  id: Generated<number>
  champ: string
  value: Buffer | null
  created_at: Date
  updated_at: Date
}

interface TexteLoiTable {
  id: string
  nb_commentaires: number
  legislature: number
  numero: number
  annexe: string | null
  type:
    | `Proposition de loi`
    | `Projet de loi`
    | `Proposition de résolution`
    | `Rapport`
    | `Rapport d'information`
    | `Avis`
  type_details: string | null
  categorie: string | null
  id_dossier_an: string
  titre: string
  date: Date
  source: string
  organisme_id: number | null
  signataires: string
  contenu: string
  created_at: Date
  updated_at: Date
}
