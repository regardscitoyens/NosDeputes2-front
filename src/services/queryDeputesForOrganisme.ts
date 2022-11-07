import { sql } from 'kysely'
import { db } from './db'
import {
  FonctionInOrganisme,
  fonctionsInOrganismeWithFeminineVersion,
} from './hardcodedData'

export type DeputeInOrganisme = {
  id: number
  slug: string
  nom: string
  nom_de_famille: string
  nom_circo: string
  mandatOngoing: boolean
  fonction: FonctionInOrganisme
  currentMember: boolean
}

export async function queryDeputesForOrganisme(
  slug: string,
): Promise<DeputeInOrganisme[]> {
  const rows = await db
    .selectFrom('organisme')
    .innerJoin(
      'parlementaire_organisme',
      'organisme.id',
      'parlementaire_organisme.organisme_id',
    )
    .innerJoin(
      'parlementaire',
      'parlementaire.id',
      'parlementaire_organisme.parlementaire_id',
    )
    .where('organisme.slug', '=', slug)
    .where(qb =>
      qb
        // Remove the very short passages, there's a bunch of them at least for commission des finances
        .where(sql`TIMESTAMPDIFF(DAY, debut_fonction, fin_fonction)`, '>', '1')
        .orWhere('fin_fonction', 'is', null),
    )
    .groupBy('parlementaire.id')
    .select('parlementaire.id as id')
    .select('parlementaire.slug as slug')
    .select('parlementaire.nom as nom')
    .select('parlementaire.nom_de_famille as nom_de_famille')
    .select('parlementaire.nom_circo as nom_circo')
    .select('parlementaire_organisme.fonction as fonction')
    .select('fin_mandat')
    .select(
      sql<0 | 1>`MAX(parlementaire_organisme.fin_fonction IS NULL)`.as(
        'has_null_fin_fonction',
      ),
    )
    .execute()
  const rowsMapped = rows.map(
    ({
      id,
      slug,
      nom,
      nom_de_famille,
      nom_circo,
      fonction,
      fin_mandat,
      has_null_fin_fonction,
    }) => ({
      id,
      slug,
      nom,
      nom_de_famille,
      nom_circo,
      fonction: normalizeFonctionInOrganisme(fonction),
      mandatOngoing: fin_mandat === null,
      currentMember: has_null_fin_fonction === 1,
    }),
  )
  return rowsMapped
}

function normalizeFonctionInOrganisme(f: string): FonctionInOrganisme {
  const entry = Object.entries(fonctionsInOrganismeWithFeminineVersion).find(
    ([k, v]) => {
      return f === k || f === v
    },
  ) as [FonctionInOrganisme, string | null] | undefined
  if (entry) {
    return entry[0]
  }
  console.log('Warning: unknown fonction', f)
  return 'membre'
}
