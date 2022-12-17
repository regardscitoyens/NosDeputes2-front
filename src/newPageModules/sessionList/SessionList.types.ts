export type Props = {
  legislature: number
  legislatureNavigationUrls: [number, string][]
  sessions: Session[]
}
export type Session = {
  uid: string
  kind: 'ordinaire' | 'extraordinaire'
  start_date: string
  end_date: string
}
