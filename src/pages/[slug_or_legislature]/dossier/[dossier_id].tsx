import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Todo } from '../../../components/Todo'
import { db } from '../../../repositories/db'
import { parseIntOrNull } from '../../../services/utils'
import PHPUnserialize from 'php-unserialize'

type Data = {
  dossier: LocalDossier
}

type LocalDossier = {
  titre_complet: string
}

// why all this ??
// linkDossiers is something like this
// (when transformed to js)
// {
//   '58' : '56',
//   '152' : '17',
//   '188' : '184',
//   '56' : '296',
//   '454' : '461',
//   '427' : '496',
// }
// Example https://www.nosdeputes.fr/16/dossier/152
// is transformed into https://www.nosdeputes.fr/16/dossier/17
// TODO understand why
// TODO do it as redirect, it's probably better for SEO etc.
async function getFinalSectionId(givenSectionId: number): Promise<number> {
  const linkdossiersRaw = (
    await db
      .selectFrom('variable_globale')
      .where('champ', '=', 'linkdossiers')
      .select('value')
      .executeTakeFirst()
  )?.value?.toString('utf-8')
  const linkDossiers = linkdossiersRaw
    ? (PHPUnserialize.unserialize(linkdossiersRaw) as { [k: string]: string })
    : null

  if (linkDossiers) {
    const link = linkDossiers[givenSectionId.toString()]
    if (link) {
      try {
        return parseInt(link, 10)
      } catch (e) {
        throw new Error(
          `Cannot parse something from linkdossiers as int: "${link}"`,
        )
      }
    }
  }
  return givenSectionId
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const idStr = context.query.dossier_id as string
  const id = parseIntOrNull(idStr)
  if (!id) {
    return {
      notFound: true,
    }
  }
  const finalSectionId = await getFinalSectionId(id)
  const dossier = await db
    .selectFrom('section')
    .where('id', '=', finalSectionId)
    .select('section.titre_complet')
    .executeTakeFirst()

  // TODO continue by copying queries from executeShow() in apps/frontend/modules/section/actions/actions.class.php

  // 1. TODO need to unserialize the variableglobale with this :
  // https://github.com/naholyr/js-php-unserialize

  // 2. TODO get seances
  // si 1 seule seance et de type 'commission' => redirect ???

  // 3. TODO get loi (via les tags loi:numero)

  // 4. Si il y a id_dossier_an OU lois
  // query sur texte_loi en se basant sur eux

  // 5. select from titre_loi à partir des texte_loi

  // 6. select from interventions

  // 7. select encore dans les tags pour faire variable qtag ?

  if (!dossier) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      data: {
        dossier,
      },
    },
  }
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { dossier } = data
  return (
    <div>
      <h1 className="text-2xl">{dossier.titre_complet}</h1>
      <Todo>Tout le dossier...</Todo>
    </div>
  )
}
