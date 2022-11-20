import { ReactNode } from 'react'
import { MyLink } from '../../components/MyLink'
import { Todo } from '../../components/Todo'
import { CURRENT_LEGISLATURE } from '../../lib/hardcodedData'
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

function SimpleBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="bg-slate-200 p-4">
      <span className="font-bold">{title} :</span>
      {children}
    </div>
  )
}

export function Page(props: types.Props) {
  const { document, auteurs, nbAmendements, subDocuments } = props
  return (
    <div>
      {buildTitle(document)}
      <SimpleBlock title="Auteurs">
        {
          <ul>
            {auteurs.map(auteur => (
              <li key={auteur.id}>{auteur.nom} </li>
            ))}
          </ul>
        }
      </SimpleBlock>

      <Todo>Afficher la date</Todo>
      <Todo>Lien vers le "dossier relatif"</Todo>
      <Todo>
        Afficher le rôle de l'auteur (rapporteur de telle ou telle commission,
        etc.)
      </Todo>
      <Todo>Distinguer les types d'auteurs, cosignataires, etc.</Todo>
      <Todo>
        Lien "consulter sur le site de l'assemblee" + lien direct pdf sur le
        site de l'assemblee
      </Todo>
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
      <Todo>Documents relatifs</Todo>
      <Todo>
        Extrait du document. C'est compliqué, actuellement en base le champ
        "contenu" contient le contenu binaire d'un fichier (un fichier HTML ou
        PDF sans doute ?), encodé en base 64. Donc il faut décoder le base64,
        écrire ça dans un fichier, puis essayer d'extraire le contenu textuel du
        fichier. Tout ça serait à revoir, pour le faire en amont, quand on
        remplit la base. L'app Next.js ne devrait pas avoir à manipuler des
        fichiers
      </Todo>
    </div>
  )
}
