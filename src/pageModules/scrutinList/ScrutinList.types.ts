export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  scrutins: Scrutin[]
}

export type Scrutin = {
  uid: string
  title: string
  sort: 'adopté' | 'rejeté'
  type_vote: {
    typeMajorite:
      | 'majorité absolue des suffrages exprimés'
      // on pourrait harmoniser ça côté CLI
      | "majorité des membres composant l'Assemblée nationale"
      | "majorité des membres composants composant l'Assemblée"
      | "majorité des membres composants composant l'Assemblée nationale"
    codeType: 'MOC' | 'SAT' | 'SPO' | 'SPS'
    libelleTypeVote: // Les motions de censure "MOC" sont tantôt labellisées "motion de censure" ou "scrutin public solennel"
    | 'motion de censure'
      | 'scrutin public solennel'
      | 'scrutin à la tribune'
      | 'scrutin public ordinaire'
      | 'scrutin public solennel'
  }
  // plein de valeurs possibles, mais elles pourraient être un peu analysées et traitées sous forme plus gérable
  demandeur_texte: string
}
