import { dbLegacy, NosDeputesDatabase } from './dbLegacy'

export type DeputeVote = {
  scrutin_id: number
  date: string
  position: NosDeputesDatabase['parlementaire_scrutin']['position']
  titre: string
}

export type DeputeVotes = DeputeVote[]

export async function queryDeputeVotes(
  id: number,
  limit = 10,
): Promise<DeputeVotes> {
  const votes = await dbLegacy
    .selectFrom('parlementaire_scrutin')
    .innerJoin('scrutin', 'scrutin.id', 'parlementaire_scrutin.scrutin_id')
    .where('parlementaire_scrutin.parlementaire_id', '=', id)
    .select('scrutin.id as scrutin_id')
    .select('scrutin.date')
    .select('parlementaire_scrutin.position')
    .select('scrutin.titre')
    .orderBy('scrutin.numero', 'desc')
    .limit(limit)
    .execute()

  // need to cast dates so it its props-serializable
  return votes.map(vote => ({
    ...vote,
    date: vote.date.toISOString(),
  }))
}
