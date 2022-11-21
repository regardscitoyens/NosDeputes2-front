import { ReactNode } from 'react'
import { MyLink } from '../../components/MyLink'
import { Todo } from '../../components/Todo'
import { CURRENT_LEGISLATURE } from '../../lib/hardcodedData'
import { formatDate } from '../../lib/utils'
import * as types from './DocumentFiche.types'

function buildTitle(document: types.Document) {
  return (
    <>
      <h1 className="text-center text-2xl">
        {document.type} n°{document.numero} {document.type_details}{' '}
        {document.titre}
      </h1>
      {document.subDocumentIdentifiers ? (
        <>
          <h2 className="text-center text-3xl">
            Tome {document.subDocumentIdentifiers.tomeNumber}
          </h2>
          {document.subDocumentIdentifiers.annexeNumber !== null ? (
            <>
              <h3 className="text-center text-4xl">
                Annexe {document.subDocumentIdentifiers.annexeNumber}
              </h3>
            </>
          ) : null}
        </>
      ) : null}
    </>
  )
}

function DocumentAssocies({
  document,
  nbAmendements,
  subDocuments,
}: Pick<types.Props, 'document' | 'nbAmendements' | 'subDocuments'>) {
  return (
    <SimpleBlock title="Documents associés">
      {
        <ul>
          {nbAmendements ? (
            <li>
              <MyLink
                href={`/${CURRENT_LEGISLATURE}/amendements/${document.numero}/all`}
              >
                Voir les {nbAmendements} amendement(s) déposé(s) sur ce texte
              </MyLink>
            </li>
          ) : null}
          {document.subDocumentIdentifiers !== null ? (
            <li>
              <MyLink href={`/16/document/${document.numero}`}>
                Voir le document racine
              </MyLink>
            </li>
          ) : null}
          {subDocuments.map(subDoc => {
            const { tomeNumber, annexeNumber } = subDoc.identifiers
            return (
              <li key={subDoc.id}>
                <MyLink href={`/16/document/${subDoc.id}`}>
                  Tome {tomeNumber}
                  {annexeNumber !== null ? ` Annexe ${annexeNumber}` : null}
                </MyLink>
              </li>
            )
          })}
        </ul>
      }
    </SimpleBlock>
  )
}

function DocumentRelatifs({
  section,
  documentsRelatifs,
}: Pick<types.Props, 'section' | 'documentsRelatifs'>) {
  return (
    <SimpleBlock title="Documents relatifs">
      {
        <ul>
          {section ? (
            <li>
              <MyLink href={`/${CURRENT_LEGISLATURE}/dossier/${section.id}`}>
                Dossier : {section.titre_complet}
              </MyLink>
            </li>
          ) : null}
          {documentsRelatifs.map(doc => (
            <li key={doc.id}>
              <MyLink href={`/16/document/${doc.id}`}>
                {doc.type} n°{doc.numero} {doc.type_details}
              </MyLink>
            </li>
          ))}
        </ul>
      }
    </SimpleBlock>
  )
}

function SimpleBlock({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <div className="bg-slate-200 p-4">
      {title && <span className="font-bold">{title} :</span>}
      {children}
    </div>
  )
}

export function Page(props: types.Props) {
  const {
    document,
    auteurs,
    nbAmendements,
    subDocuments,
    section,
    documentsRelatifs,
  } = props
  return (
    <div>
      <SimpleBlock>
        {buildTitle(document)}
        <p className="my-2 mt-4">Daté du {formatDate(document.date)}</p>
        {section !== null ? (
          <p className="my-2">
            <MyLink href={`/${CURRENT_LEGISLATURE}/dossier/${section.id}`}>
              Voir le dossier correspondant
            </MyLink>
          </p>
        ) : null}
        <p className="my-2">
          <MyLink href={document.source} targetBlank>
            Voir le document sur le site de l'assemblée (version web)
          </MyLink>
        </p>
        <p className="my-2">
          <MyLink href={document.sourcePdf} targetBlank>
            Voir le document sur le site de l'assemblée (version PDF)
          </MyLink>
        </p>
        <p className="font-bold">Auteurs</p>
        {
          <ul>
            {auteurs.map(auteur => (
              <li key={auteur.id}>{auteur.nom} </li>
            ))}
          </ul>
        }
      </SimpleBlock>

      <Todo>
        Afficher le rôle de l'auteur (rapporteur de telle ou telle commission,
        etc.)
      </Todo>
      <Todo>Distinguer les types d'auteurs, cosignataires, etc.</Todo>

      <div className="flex flex-row space-x-4">
        <div className="w-1/2">
          <Todo>
            Extrait du document. C'est compliqué, actuellement en base le champ
            "contenu" contient le contenu binaire d'un fichier (un fichier HTML
            ou PDF sans doute ?), encodé en base 64. Donc il faut décoder le
            base64, écrire ça dans un fichier, puis essayer d'extraire le
            contenu textuel du fichier. Tout ça serait à revoir, pour le faire
            en amont, quand on remplit la base. L'app Next.js ne devrait pas
            avoir à manipuler des fichiers
          </Todo>
        </div>
        <div className="w-1/2 ">
          <DocumentAssocies {...{ document, subDocuments, nbAmendements }} />
          <DocumentRelatifs {...{ section, documentsRelatifs }} />
        </div>
      </div>
    </div>
  )
}