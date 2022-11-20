import { GetServerSideProps } from 'next'
import { db } from '../../lib/db'
import { parseIntOrNull } from '../../lib/utils'

import * as types from './DocumentFiche.types'

// ex :
// https://www.nosdeputes.fr/16/document/219
// https://www.nosdeputes.fr/16/document/336
// https://www.nosdeputes.fr/16/document/16
// https://www.nosdeputes.fr/16/document/16-ti
// https://www.nosdeputes.fr/16/document/292-tii
// https://www.nosdeputes.fr/16/document/292-tiii-a33
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
}

function parseAnnexeField(
  annexe: string | null,
): types.SubDocumentDetails | null {
  if (annexe) {
    try {
      // example values :
      // T01
      // T02
      // BT01
      // BT11
      // BT03A45
      // I don't think the leading B means anything
      const regexp = /^B?T0*(\d+)(?:A0*(\d+))?$/
      const [, tomeNumberStr, annexeNumberStr] = annexe.match(regexp) || []
      if (tomeNumberStr) {
        return {
          tomeNumber: parseInt(tomeNumberStr, 10),
          annexeNumber: annexeNumberStr ? parseInt(annexeNumberStr, 10) : null,
        }
      }
    } catch (e) {
      console.error(`Failed to parse annexe field : "${annexe}"`, e)
    }
  }
  return null
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
    .select(['id', 'date', 'titre', 'type', 'numero', 'type_details', 'annexe'])
    .executeTakeFirst()

  if (!texteLoiRaw) {
    return {
      notFound: true,
    }
  }

  const { annexe, ...restOfTextLoiRaw } = texteLoiRaw
  const subDocumentDetails = parseAnnexeField(annexe)
  const texteLoi = {
    ...restOfTextLoiRaw,
    date: texteLoiRaw.date.toISOString(),
    subDocumentDetails,
  }

  return {
    props: {
      data: {
        texteLoi,
        auteurs: await getAuteurs(id),
      },
    },
  }
}
