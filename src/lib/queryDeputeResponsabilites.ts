export type DeputeResponsabilite = {
  nom: string
  slug: string
  type: 'parlementaire' | 'extra' | 'groupe' | 'groupes'
  fonction: string
}

export type DeputeResponsabilites = DeputeResponsabilite[]
