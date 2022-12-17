import { dbReleve } from './dbReleve'

export async function querySessions(legislature: number) {
  const rows = await dbReleve
    .selectFrom('sessions')
    .where('legislature', '=', legislature)
    .orderBy('start_date')
    .orderBy('end_date')
    .select(['uid', 'ordinaire', 'start_date', 'end_date'])
    .execute()

  const sessions: Session[] = rows.map(row => ({
    uid: row.uid,
    kind: row.ordinaire ? 'ordinaire' : 'extraordinaire',
    start_date: row.start_date.toISOString(),
    end_date: row.end_date.toISOString(),
  }))
  return sessions
}

export type Session = {
  uid: string
  kind: 'ordinaire' | 'extraordinaire'
  start_date: string
  end_date: string
}
