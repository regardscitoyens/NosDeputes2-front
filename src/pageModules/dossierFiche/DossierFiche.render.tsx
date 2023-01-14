import { MyLink } from '../../components/MyLink'
import { simplifyCommissionName } from '../../lib/hardcodedData'
import * as acteTypes from '../../lib/types/acte'
import { capitalizeFirstLetter, formatDate } from '../../lib/utils'
import * as types from './DossierFiche.types'

const f = formatDate

export function Page(props: types.Props) {
  const { dossier, organes, acteurs } = props
  console.log('@@@@ dossier', dossier)
  // console.log('@@@@ organes', organes)
  const {
    xsiType,
    legislature,
    titreDossier,
    initiateur,
    fusionDossier,
    actesLegislatifs,
  } = dossier
  const { titre, senatChemin, titreChemin } = titreDossier
  const urlAn = `http://www.assemblee-nationale.fr/dyn/${legislature}/dossiers/${titreChemin}`

  return (
    <div>
      <div className="">
        <div className="text-center italic">
          <p>{dossier.procedureParlementaire.libelle}</p>
          <p className="font-serif text-2xl italic">«{titre}»</p>
        </div>
        <p className="text-xs italic text-slate-400">{xsiType}</p>
        <FusionDossier {...{ fusionDossier }} />
        <p>
          <MyLink href={urlAn} targetBlank>
            Voir ce dossier sur le site de l'Assemblée Nationale
          </MyLink>
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
        <Initiateur {...{ initiateur, organes, acteurs }} />
      </div>

      <ActeLegislatifs {...{ actesLegislatifs, organes, acteurs }} />
    </div>
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
        <p className="font-bold">Initiateur: </p>
        {organe && <p>{organe.libelle}</p>}
        {acteurs && (
          <ul>
            {acteurs.map(acteur => {
              const { acteurRef } = acteur
              const foundActeur = findActeur(acteurRef, allActeurs)
              return (
                <li key={acteurRef}>{foundActeur?.full_name ?? acteurRef}</li>
              )
            })}
          </ul>
        )}
      </>
    )
  }
  return null
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
}: {
  actesLegislatifs: types.Props['dossier']['actesLegislatifs']
  organes: types.Organe[]
}) {
  if (actesLegislatifs) {
    return (
      <div className="mt-8">
        {actesLegislatifs.map(childActe => {
          return <Acte key={childActe.uid} acte={childActe} organes={organes} />
        })}
      </div>
    )
  }
  return null
}

function Acte({
  acte,
  organes,
}: {
  acte: acteTypes.ActeLegislatif
  organes: types.Organe[]
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
        <ul>
          {acte.rapporteurs.map(rapporteur => {
            return (
              <li key={rapporteur.acteurRef}>
                {rapporteur.typeRapporteur} {rapporteur.acteurRef}
              </li>
            )
          })}
        </ul>
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
      {xsiType !== 'Etape_Type' && (
        <p className="text-xs italic text-slate-400">{xsiType}</p>
      )}

      <ul>
        {actesLegislatifs?.map(childActe => {
          return (
            <li className="flex" key={childActe.uid}>
              {childActe.xsiType === 'Etape_Type' ? (
                <div className=" mx-2 mt-10 text-center">⇨</div>
              ) : (
                <div className=" mx-2 flex items-center justify-center">⮕</div>
              )}

              <Acte acte={childActe} organes={organes} />
            </li>
          )
        })}
      </ul>
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
