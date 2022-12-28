import { MyLink } from '../../components/MyLink'
import { ActeLegislatif } from '../../lib/acteLegislatif'
import { capitalizeFirstLetter, formatDate } from '../../lib/utils'
import * as types from './DossierFiche.types'

const f = formatDate

export function Page(props: types.Props) {
  const { dossier, organes } = props
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
        <p>Législature : {dossier.legislature}</p>
        <Initiateur {...{ initiateur }} />
      </div>

      <ActeLegislatifs {...{ actesLegislatifs, organes }} />
    </div>
  )
}

function Initiateur({
  initiateur,
}: {
  initiateur: types.Props['dossier']['initiateur']
}) {
  if (initiateur) {
    const { organeRef, acteurs } = initiateur
    return (
      <>
        <p className="font-bold">Initiateur: </p>
        {organeRef && <p>{organeRef}</p>}
        {acteurs && (
          <ul>
            {acteurs.map(acteur => {
              return (
                <li key={acteur.acteurRef}>
                  {acteur.acteurRef} avec mandat {acteur.mandatRef}
                </li>
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
  acte: ActeLegislatif
  organes: types.Organe[]
}) {
  const { xsiType, organeRef, libelleActe, actesLegislatifs, texteAssocieRef } =
    acte
  const organe = findOrgane(organeRef, organes)
  const isLeaf = (actesLegislatifs || []).length === 0
  return (
    <div
      className={`my-2 border-2  px-4 py-2 shadow-lg ${
        isLeaf
          ? 'border-slate-500 bg-slate-50 shadow-slate-400'
          : 'border-slate-300 bg-slate-200'
      }`}
    >
      <div className="flex space-x-2 ">
        {acte.dateActe && <p className="font-bold">{f(acte.dateActe)} </p>}
        {organe && <p className=" text-slate-500">{organe.libelle}</p>}
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
      <p className="text-xs italic text-slate-400">{xsiType}</p>

      {actesLegislatifs?.map(childActe => {
        return <Acte key={childActe.uid} acte={childActe} organes={organes} />
      })}
    </div>
  )
}

function findOrgane(
  organeRef: string,
  organes: types.Organe[],
): types.Organe | null {
  return organes.find(_ => _.uid === organeRef) ?? null
}
