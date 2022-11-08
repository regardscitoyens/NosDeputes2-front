export type Props = {
  scrutin: Scrutin
}

export type Scrutin = {
  id: number
  titre: string
  seance_id: number | null
  date: string
  type: 'solennel' | 'ordinaire'
  sort: 'rejeté' | 'adopté'
  interventionMd5: string | null
  nombre_pours: number
  nombre_contres: number
  nombre_abstentions: number
  demandeurs: string | null
  votesGrouped: { [acronym: string]: Vote[] }
}

export type Vote = {
  id: number
  parlementaire_id: number
  parlementaire_nom: string
  parlementaire_slug: string
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
}
