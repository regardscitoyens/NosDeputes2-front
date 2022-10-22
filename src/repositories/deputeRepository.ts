import { db } from './db'

export type BasicDeputeInfo = {
  date_naissance: string
  profession: string | null
  num_circo: number
  debut_mandat: string
  fin_mandat: string | null
  slug: string
}

export async function queryDeputeInfo(slug: string): Promise<BasicDeputeInfo> {
  const foo = await db
    .selectFrom('parlementaire')
    .select([
      'date_naissance',
      'profession',
      'num_circo',
      'debut_mandat',
      'fin_mandat',
      'slug',
    ])
    .where('slug', '=', slug)
    .executeTakeFirst()
  if (!foo) {
    throw new Error(`Didn't find depute with slug ${slug}`)
  }
  return {
    ...foo,
    date_naissance: foo.date_naissance.toISOString(),
    debut_mandat: foo.debut_mandat.toISOString(),
    fin_mandat: foo.fin_mandat?.toISOString() ?? null,
  }
}
