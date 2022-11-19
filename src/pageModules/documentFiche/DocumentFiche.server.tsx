import { GetServerSideProps } from 'next'
import { db } from '../../lib/db'

import * as types from './DocumentFiche.types'

// ex :
// https://www.nosdeputes.fr/16/document/219
// https://www.nosdeputes.fr/16/document/336
// https://www.nosdeputes.fr/16/document/16
// https://www.nosdeputes.fr/16/document/16-ti
// https://www.nosdeputes.fr/16/document/16-tii
// ref files php :
// apps/frontend/modules/documents/actions/actions.class.php
// apps/frontend/modules/documents/templates/showSuccess.php

async function getAuteurs(texteLoiId: string): Promise<types.Author[]> {
  const foo = await db
    .selectFrom('parlementaire')
    .innerJoin(
      'parlementaire_texteloi',
      'parlementaire.id',
      'parlementaire_texteloi.parlementaire_id',
    )
    .where('parlementaire_texteloi.texteloi_id', '=', texteLoiId)
    // Why ?
    .where('parlementaire_texteloi.importance', '<', 4)
    .orderBy('parlementaire_texteloi.importance')
    .orderBy('parlementaire.nom_de_famille')
    .select(['parlementaire.id', 'parlementaire.nom'])
    .execute()
  return foo
  // return null as any
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const id = context.query.id as string

  // TODO redirect si truc dans titre loi ?
  // if ($loi = Doctrine::getTable('Titreloi')->findLightLoi("$id"))
  //    $this->redirect('@loi?loi='.$id);

  const texteLoiRaw = await db
    .selectFrom('texteloi')
    .where('id', '=', id)
    .select(['id', 'date', 'titre', 'type', 'numero', 'type_details'])
    .executeTakeFirst()

  if (!texteLoiRaw) {
    return {
      notFound: true,
    }
  }

  const texteLoi = { ...texteLoiRaw, date: texteLoiRaw.date.toISOString() }

  return {
    props: {
      data: {
        texteLoi,
        auteurs: await getAuteurs(id),
      },
    },
  }
}
