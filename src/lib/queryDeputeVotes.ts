export type DeputeVote = {
  scrutin_id: number
  date: string
  position: 'pour' | 'nonVotant' | 'abstention' | 'contre' | null
  titre: string
}

export type DeputeVotes = DeputeVote[]
