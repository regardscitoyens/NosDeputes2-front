import { AmendementsSort } from './hardcodedData'

export type AmendementsDeputeSummary = Record<
  AmendementsSort | 'Total',
  {
    proposes: number
    signes: number
  }
>
