export type Props = {
  sectionsGroupedByMonth: (readonly [string, Section[]])[]
}

export type Section = {
  id: number
  titre_complet: string
  min_date: string
  nb_interventions: number
}
