import { sql } from 'kysely'
import { GetServerSideProps } from 'next'
import { db } from '../../lib/db'
import sortBy from 'lodash/sortBy'
import * as types from './DocumentFiche.types'

// ex :
// https://www.nosdeputes.fr/16/document/219
// https://www.nosdeputes.fr/16/document/336
// https://www.nosdeputes.fr/16/document/272 (a des amendements)
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

async function getSection(doc: {
  id_dossier_an: string
  numero: number
}): Promise<types.Section | null> {
  // there are two ways to link the document and the section, not sure why
  const section = await db
    .selectFrom('section')
    .where('id_dossier_an', '=', doc.id_dossier_an)
    // I think here we want to link to the root section
    // The PHP doesn't seem to use this restriction and thus sometimes
    // links to a random subsection
    .whereRef('section.section_id', '=', 'section.id')
    .select(['id', 'titre_complet'])
    .executeTakeFirst()
  if (section) {
    return section
  }
  return (
    (await db
      .selectFrom('tag')
      .innerJoin('tagging', 'tag.id', 'tagging.tag_id')
      .innerJoin('section', 'tagging.taggable_id', 'section.id')
      .where('tagging.taggable_model', '=', 'Section')
      .whereRef('section.section_id', '=', 'section.id')
      .where('tag.is_triple', '=', 1)
      .where('tag.triple_namespace', '=', 'loi')
      .where('tag.triple_key', '=', 'numero')
      .where('tag.triple_value', '=', doc.numero.toString())
      .select(['section.id', 'section.titre_complet'])
      .executeTakeFirst()) ?? null
  )
}

async function getDocumentsRelatifs(doc: {
  id: string
  id_dossier_an: string
  numero: number
}): Promise<types.DocumentRelatif[]> {
  const rows = await db
    .selectFrom('texteloi')
    .where('id_dossier_an', '=', doc.id_dossier_an)
    .where('id', '!=', doc.id)
    // on ne prend que des document racines
    .where('annexe', 'is', null)
    .orderBy('numero')
    .select(['id', 'type', 'type_details', 'numero'])
    .execute()
  return rows
}

function parseAnnexeField(annexe: string): types.SubDocumentIdentifiers {
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
    return {
      tomeNumber: parseInt(tomeNumberStr, 10),
      annexeNumber: annexeNumberStr ? parseInt(annexeNumberStr, 10) : null,
    }
  } catch (e) {
    throw new Error(`Failed to parse annexe field : "${annexe}"`)
  }
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const id = context.query.id as string

  const { count } = db.fn

  const documentRaw = await db
    .selectFrom('texteloi')
    .where('id', '=', id)
    .select([
      'id',
      'date',
      'titre',
      'type',
      'numero',
      'type_details',
      'annexe',
      'id_dossier_an',
    ])
    .executeTakeFirst()

  if (!documentRaw) {
    return {
      notFound: true,
    }
  }

  const nbAmendements = (
    await db
      .selectFrom('amendement')
      .where('texteloi_id', '=', documentRaw.numero.toString())
      .select(count<number>('amendement.id').as('nb'))
      .executeTakeFirstOrThrow()
  ).nb

  // les sous-documents du document racine
  const subDocumentsRaw = await db
    .selectFrom('texteloi')
    .where('numero', '=', documentRaw.numero)
    .where('id', '!=', documentRaw.id)
    .where('annexe', 'is not', null)
    .select('id')
    // trick because Kysely doesn't understand that it can't be null
    .select(sql<string>`annexe`.as('annexe'))
    .execute()

  const subDocuments = sortBy(
    subDocumentsRaw.map(({ annexe, ...rest }) => ({
      ...rest,
      identifiers: parseAnnexeField(annexe),
    })),
    _ => _.identifiers.tomeNumber * 10000 + (_.identifiers.annexeNumber || 0),
  )

  const documentsRelatifs = await getDocumentsRelatifs(documentRaw)

  const { annexe, id_dossier_an, ...restOfDocumentRaw } = documentRaw

  const document = {
    ...restOfDocumentRaw,
    date: documentRaw.date.toISOString(),
    subDocumentIdentifiers: annexe !== null ? parseAnnexeField(annexe) : null,
  }

  return {
    props: {
      data: {
        document,
        auteurs: await getAuteurs(id),
        nbAmendements,
        subDocuments,
        documentsRelatifs,
        section: await getSection(documentRaw),
      },
    },
  }
}
