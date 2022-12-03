import { sql } from 'kysely'
import { GetServerSideProps } from 'next'
import { dbLegacy } from '../../lib/dbLegacy'
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
// https://www.nosdeputes.fr/16/document/285-t1 (pas d'auteurs ni cosignataires)
// ref files php :
// apps/frontend/modules/documents/actions/actions.class.php
// apps/frontend/modules/documents/templates/showSuccess.php

async function getAuteursOrCosignataires(
  texteLoiId: string,
  kind: 'auteurs' | 'cosignataires',
): Promise<types.Depute[]> {
  return await dbLegacy
    .selectFrom('parlementaire')
    .innerJoin(
      'parlementaire_texteloi',
      'parlementaire.id',
      'parlementaire_texteloi.parlementaire_id',
    )
    .where('parlementaire_texteloi.texteloi_id', '=', texteLoiId)
    // weird distinction based on importance
    // but that's what the PHP does
    .where(
      'parlementaire_texteloi.importance',
      kind === 'auteurs' ? '<' : '>=',
      4,
    )
    .orderBy('parlementaire_texteloi.importance')
    .orderBy('parlementaire.nom_de_famille')
    .select(['parlementaire.id', 'parlementaire.nom'])
    .execute()
}

async function getSection(doc: {
  id_dossier_an: string
  numero: number
}): Promise<types.Section | null> {
  // there are two ways to link the document and the section, not sure why
  const section = await dbLegacy
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
    (await dbLegacy
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
  const rows = await dbLegacy
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

function buildSourcePdf(source: string) {
  // http://www.assemblee-nationale.fr/16/rapports/r0016-tII.asp
  // becomes
  // http://www.assemblee-nationale.fr/16/pdf/rapports/r0016-tII.pdf
  return source.replace(/\.asp$/, '.pdf').replace(/(\/\d+\/)/, '$1pdf/')
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const id = context.query.id as string

  const { count } = dbLegacy.fn

  const documentRaw = await dbLegacy
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
      'source',
    ])
    .executeTakeFirst()

  if (!documentRaw) {
    return {
      notFound: true,
    }
  }

  const nbAmendements = (
    await dbLegacy
      .selectFrom('amendement')
      .where('texteloi_id', '=', documentRaw.numero.toString())
      .select(count<number>('amendement.id').as('nb'))
      .executeTakeFirstOrThrow()
  ).nb

  // les sous-documents du document racine
  const subDocumentsRaw = await dbLegacy
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
    sourcePdf: buildSourcePdf(documentRaw.source),
  }

  return {
    props: {
      data: {
        document,
        auteurs: await getAuteursOrCosignataires(id, 'auteurs'),
        cosignataires: await getAuteursOrCosignataires(id, 'cosignataires'),
        nbAmendements,
        subDocuments,
        documentsRelatifs,
        section: await getSection(documentRaw),
      },
    },
  }
}
