import { db } from './db'
import { AmendementsSort, amendementsSorts } from './hardcodedData'

export type AmendementsDeputeSummary = Record<
  AmendementsSort | 'Total',
  {
    proposes: number
    signes: number
  }
>

export async function queryDeputeAmendementsSummary(
  id: number,
): Promise<AmendementsDeputeSummary> {
  const { count } = db.fn

  const proposes = await db
    .selectFrom('amendement')
    .where('amendement.auteur_id', '=', id)
    .where('amendement.sort', '<>', 'Rectifié')
    .groupBy('amendement.sort')
    .select('amendement.sort')
    .select(count<number>('amendement.id').as('count'))
    .execute()

  const signes = await db
    .selectFrom('amendement')
    .leftJoin(
      'parlementaire_amendement',
      'parlementaire_amendement.amendement_id',
      'amendement.id',
    )
    .where('parlementaire_amendement.parlementaire_id', '=', id)
    .where('amendement.sort', '<>', 'Rectifié')
    .groupBy('amendement.sort')
    .select('amendement.sort')
    .select(count<number>('amendement.id').as('count'))
    .execute()

  // create empty object
  const amendementsSummary: AmendementsDeputeSummary = Object.fromEntries(
    [...amendementsSorts, 'Total'].map(sort => [
      sort,
      {
        proposes: 0,
        signes: 0,
      },
    ]),
  )

  // compute data and total
  return amendementsSorts.reduce((summary, sort) => {
    const proposesCount =
      proposes.find(amendement => amendement.sort === sort)?.count || 0
    const signesCount =
      signes.find(amendement => amendement.sort === sort)?.count || 0
    summary[sort] = {
      proposes: proposesCount,
      signes: signesCount,
    }
    summary.Total = {
      proposes: summary.Total.proposes + proposesCount,
      signes: summary.Total.signes + signesCount,
    }
    return summary
  }, amendementsSummary)
}
