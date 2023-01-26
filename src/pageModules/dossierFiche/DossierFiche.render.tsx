import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import uniqBy from 'lodash/uniqBy'
import { Fragment, ReactNode, useState } from 'react'
import { DeputeItem } from '../../components/DeputeItem'
import { MyLink } from '../../components/MyLink'
import {
  LATEST_LEGISLATURE,
  simplifyCommissionName,
} from '../../lib/hardcodedData'
import * as acteTypes from '../../lib/types/acte'
import { capitalizeFirstLetter, formatDate } from '../../lib/utils'
import * as types from './DossierFiche.types'

const f = formatDate

export function Page(props: types.Props) {
  const { dossier, organes, acteurs } = props
  // console.log('@@@@ dossier', dossier)
  // console.log('@@@@ organes', organes)
  // console.log('@@@@ acteurs', acteurs)
  const {
    xsiType,
    legislature,
    titreDossier,
    initiateur,
    fusionDossier,
    actesLegislatifs,
    plf,
  } = dossier
  const { titre, senatChemin, titreChemin } = titreDossier
  const urlAn = `http://www.assemblee-nationale.fr/dyn/${legislature}/dossiers/${titreChemin}`

  return (
    <div>
      <div className="my-4 bg-slate-200 p-4 shadow">
        <div className="text-center">
          <p className="font-serif text-4xl font-bold italic">«{titre}»</p>
          <p className="">{dossier.procedureParlementaire.libelle}</p>
        </div>
        <p className="text-xs italic text-slate-400">{xsiType}</p>
        <p>
          <MyLink href={urlAn} targetBlank>
            Voir ce dossier sur le site de l'Assemblée Nationale
          </MyLink>
        </p>
        <p>
          {senatChemin && (
            <>
              {' '}
              ou{' '}
              <MyLink href={senatChemin} targetBlank>
                sur le site du Sénat
              </MyLink>
            </>
          )}
        </p>
        <FusionDossier {...{ fusionDossier }} />
        <Initiateur {...{ initiateur, organes, acteurs }} />
        {/* TODO process all this plf object, bunch of stuff */}
        {/* {plf && (
          <div>
            PLF :{' '}
            <code>{JSON.stringify(plf, null, 2).slice(0, 100) + '...'}</code>
          </div>
        )} */}
      </div>

      <ActeLegislatifs {...{ actesLegislatifs, organes, acteurs }} />
    </div>
  )
}

function Acteur({
  acteurRef,
  acteurs,
}: {
  acteurRef: string
  acteurs: types.Acteur[]
}) {
  const foundActeur = findActeur(acteurRef, acteurs)
  // TODO is this "legislature" correct ?
  // TODO fix other fields
  return foundActeur ? (
    <DeputeItem
      depute={{
        ...foundActeur,
        fullName: foundActeur.full_name,
        circo_departement: '',
        slug: '',
        mandat_ongoing: true,
      }}
      legislature={LATEST_LEGISLATURE}
      className="grow"
    />
  ) : (
    <span>Acteur n°{acteurRef}</span>
  )
}

function Initiateur({
  initiateur,
  organes,
  acteurs: allActeurs,
}: {
  initiateur: types.Props['dossier']['initiateur']
  organes: types.Organe[]
  acteurs: types.Acteur[]
}) {
  if (initiateur) {
    const { organeRef, acteurs } = initiateur
    const organe = organeRef ? findOrgane(organeRef, organes) : null
    return (
      <>
        <p className="font-bold">Initiateur(s) :</p>
        {organe && <p>{organe.libelle}</p>}
        {acteurs && (
          <ul>
            {uniqBy(acteurs, _ => _.acteurRef).map(acteur => {
              const { acteurRef } = acteur
              return (
                <Acteur
                  key={acteurRef}
                  {...{ acteurRef }}
                  acteurs={allActeurs}
                />
              )
            })}
          </ul>
        )}
      </>
    )
  }
  return null
}

function LinkToSeance({ reunionRef }: { reunionRef: string }) {
  if (reunionRef.startsWith('RUSN')) {
    return <span>Réunion du sénat {reunionRef}</span>
  }

  const regex = /^RUANR5L(\d+)S/
  const matches = reunionRef.match(regex)
  const legislatureStr = matches && matches[1]
  if (!legislatureStr) {
    throw new Error(`Couldn't parse ${reunionRef} as a seance uid`)
  }
  const legislature = parseInt(legislatureStr, 10)
  return (
    <MyLink targetBlank href={`/seances/${legislatureStr}#${reunionRef}`}>
      voir la séance
    </MyLink>
  )
}

function FusionDossier({
  fusionDossier,
}: {
  fusionDossier: types.Props['dossier']['fusionDossier']
}) {
  if (fusionDossier) {
    const { cause, dossierAbsorbantRef } = fusionDossier
    const link = (
      <MyLink href={`/dossier/${dossierAbsorbantRef}`}>
        {dossierAbsorbantRef}
      </MyLink>
    )
    switch (cause) {
      case 'Dossier absorbé':
        return (
          <p className="text-lg font-bold text-amber-700">
            Dossier absorbé par {link}
          </p>
        )
      case 'Examen commun':
        return <p className="font-bold">Lié à au dossier {link}</p>
    }
  }
  return null
}

function ActeLegislatifs({
  actesLegislatifs,
  organes,
  acteurs,
}: {
  actesLegislatifs: types.Props['dossier']['actesLegislatifs']
  organes: types.Organe[]
  acteurs: types.Acteur[]
}) {
  if (actesLegislatifs) {
    return (
      <div className="mt-8">
        {actesLegislatifs.map(childActe => {
          return (
            <Acte
              key={childActe.uid}
              acte={childActe}
              {...{ organes, acteurs }}
            />
          )
        })}
      </div>
    )
  }
  return null
}

function Rapporteurs({
  acte,
  acteurs,
}: {
  acte: acteTypes.ActeLegislatifConcret & { xsiType: 'NominRapporteurs_Type' }
  acteurs: types.Acteur[]
}) {
  const { rapporteurs } = acte
  if (rapporteurs && rapporteurs.length) {
    // here we have to reformulate the type in a different way, otherwise the groupBy method is confused
    const rapporteursTypedBetter: {
      typeRapporteur: string
      acteurRef: string
      etudePlfRef?: string
    }[] = rapporteurs
    return (
      <div>
        {Object.entries(
          groupBy(rapporteursTypedBetter, _ => _.typeRapporteur),
        ).map(([typeRapporteur, rapporteurs]) => {
          const rapporteursWithActeurs = rapporteurs.map(_ => {
            return {
              ..._,
              acteur: findActeur(_.acteurRef, acteurs),
            }
          })
          const rapporteursReorganized = sortBy(
            Object.values(
              groupBy(
                rapporteursWithActeurs,
                _ => _.acteur?.latestGroup?.acronym,
              ),
            ),
            _ => -_.length,
          ).flat()
          return (
            <Fragment key={typeRapporteur}>
              <p>{typeRapporteur}</p>
              <div className="flex flex-wrap gap-2">
                {rapporteursReorganized.map(rapporteur => {
                  const { acteurRef, etudePlfRef, acteur } = rapporteur
                  // TODO handle etudePlfRef
                  // TODO is this "legislature" correct ? NO, we should query the group at the given date
                  // TODO fix other fields
                  return (
                    <div key={acteurRef} className="grow">
                      {acteur ? (
                        <DeputeItem
                          depute={{
                            ...acteur,
                            fullName: acteur.full_name,
                            circo_departement: '',
                            slug: '',
                            mandat_ongoing: true,
                          }}
                          legislature={LATEST_LEGISLATURE}
                          className="grow"
                        />
                      ) : (
                        <span>Acteur n°{acteurRef}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </Fragment>
          )
        })}
      </div>
    )
  }
  return null
}

function Foldable({ children }: { children: ReactNode }) {
  const [folded, setFolded] = useState<boolean>(true)
  return (
    <div>
      <button
        className="rounded bg-slate-400 px-2 text-slate-200"
        onClick={() => setFolded(_ => !_)}
      >
        {folded ? '(...) déplier' : 'replier'}
      </button>
      {folded ? null : children}
    </div>
  )
}

function Acte({
  acte,
  organes,
  acteurs,
}: {
  acte: acteTypes.ActeLegislatif
  organes: types.Organe[]
  acteurs: types.Acteur[]
}) {
  const { xsiType, organeRef, libelleActe } = acte
  const actesLegislatifs = acteTypes.getChildrenOfActe(acte)
  const texteAssocieRef = acte.xsiType !== 'Etape_Type' && acte.texteAssocieRef
  const dateActe = acte.xsiType !== 'Etape_Type' && acte.dateActe
  const organe = findOrgane(organeRef, organes)
  const isLeaf = (actesLegislatifs || []).length === 0
  return (
    <div
      className={`my-2 rounded-lg px-4 py-2  ${
        isLeaf ? ' w-fit bg-slate-200 shadow shadow-slate-400' : ''
      }`}
    >
      <div className="flex space-x-2 ">
        {dateActe && <p className="font-bold">{f(dateActe)} </p>}
        {organe && (
          <p className=" text-slate-500">
            {organe.code_type === 'COMPER'
              ? simplifyCommissionName(organe.libelle)
              : organe.libelle}
          </p>
        )}
      </div>
      <p className="font-mono ">{capitalizeFirstLetter(libelleActe)}</p>
      {texteAssocieRef && (
        <p className="italic">
          <MyLink
            href={`https://www.assemblee-nationale.fr/dyn/docs/${texteAssocieRef}.raw`}
          >
            Texte associé {acte.texteAssocieRef}
          </MyLink>
        </p>
      )}
      {acte.xsiType === 'EtudeImpact_Type' && (
        <p className="italic">
          Contribution d'internautes
          {acte.contributionInternaute.dateOuverture && (
            <span>Du {f(acte.contributionInternaute.dateOuverture)}</span>
          )}
          {acte.contributionInternaute.dateFermeture && (
            <span>au {f(acte.contributionInternaute.dateFermeture)}</span>
          )}
        </p>
      )}
      {acte.xsiType === 'NominRapporteurs_Type' && (
        <Rapporteurs {...{ acteurs, acte }} />
      )}
      {acte.xsiType === 'DeclarationGouvernement_Type' && (
        <p>{JSON.stringify(acte.typeDeclaration)}</p>
      )}
      {acte.xsiType === 'DiscussionSeancePublique_Type' && (
        <p>
          <LinkToSeance reunionRef={acte.reunionRef} />
        </p>
      )}
      {acte.xsiType === 'DiscussionCommission_Type' && (
        <p>
          reunionRef <code>{acte.reunionRef}</code>
        </p>
      )}
      {acte.xsiType === 'DepotRapport_Type' &&
        (acte.libelleActe === 'Dépôt de rapport' ||
          acte.libelleActe === "Dépôt du rapport d'une CMP") &&
        acte.texteAdopteRef && (
          <p>
            texteAdopteRef <code>{acte.texteAdopteRef}</code>
          </p>
        )}
      {acte.xsiType === 'Promulgation_Type' && (
        <>
          <p className="">"{acte.titreLoi}"</p>
          <p className="">Code {acte.codeLoi}</p>
          {acte.urlLegifrance && (
            <p className="">
              <MyLink href={acte.urlLegifrance}>{acte.urlLegifrance}</MyLink>
            </p>
          )}
          {acte.urlEcheancierLoi && (
            <p className="">
              <MyLink href={acte.urlEcheancierLoi}>
                {acte.urlEcheancierLoi}
              </MyLink>
            </p>
          )}
          {acte.texteLoiRef && (
            <p className="">texteLoiRef : {acte.texteLoiRef}</p>
          )}
          {acte.referenceNor && (
            <p className="">referenceNor : {acte.referenceNor}</p>
          )}
        </>
      )}
      {acte.xsiType === 'Decision_Type' && (
        <>
          {acte.statutConclusion && (
            <p>
              <span className="font-bold">{acte.statutConclusion.libelle}</span>{' '}
              <span className="font-mono text-sm">
                {acte.statutConclusion.famCode}
              </span>
            </p>
          )}
          {acte.libelleActe === 'Décision' && (
            <>
              {acte.textesAssocies?.map(texteAssocie => {
                const { texteAssocieRef, typeTexte } = texteAssocie
                return (
                  <p key={texteAssocieRef} className="italic">
                    Texte associé{' '}
                    <MyLink
                      href={`https://www.assemblee-nationale.fr/dyn/docs/${texteAssocieRef}.raw`}
                    >
                      {texteAssocieRef}
                    </MyLink>{' '}
                    <span className="text-slate-400">(type "{typeTexte}")</span>
                  </p>
                )
              })}
              {acte.reunionRef && (
                <p>
                  reunionRef <code>{acte.reunionRef}</code>
                </p>
              )}
              {acte.voteRefs && (
                <p>
                  voteRefs <code>{JSON.stringify(acte.voteRefs)}</code>
                </p>
              )}
            </>
          )}
        </>
      )}
      {xsiType !== 'Etape_Type' && (
        <p className="text-xs italic text-slate-400">{xsiType}</p>
      )}
      {actesLegislatifs && actesLegislatifs.length > 0 && (
        <Foldable>
          <ul>
            {actesLegislatifs.map(childActe => {
              return (
                <li className="flex" key={childActe.uid}>
                  {childActe.xsiType === 'Etape_Type' ? (
                    <div className=" mx-2 mt-10 text-center">⇨</div>
                  ) : (
                    <div className=" mx-2 flex items-center justify-center">
                      ⮕
                    </div>
                  )}

                  <Acte acte={childActe} {...{ organes, acteurs }} />
                </li>
              )
            })}
          </ul>
        </Foldable>
      )}
    </div>
  )
}

function findOrgane(
  organeRef: string,
  organes: types.Organe[],
): types.Organe | null {
  return organes.find(_ => _.uid === organeRef) ?? null
}

function findActeur(
  acteurRef: string,
  acteurs: types.Acteur[],
): types.Acteur | null {
  return acteurs.find(_ => _.uid === acteurRef) ?? null
}
