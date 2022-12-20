import { MyLink } from '../../components/MyLink'
import * as types from './DossierFiche.types'
import * as dossierTypes from '../../lib/dossier'
import { formatDate, formatDateWithTimeAndWeekday } from '../../lib/utils'

export function Page(props: types.Props) {
  const { dossier } = props
  console.log('@@@@ dossier', dossier)
  const {
    legislature,
    titreDossier,
    initiateur,
    fusionDossier,
    actesLegislatifs,
  } = dossier
  const { titre, senatChemin, titreChemin } = titreDossier
  const urlAn = `http://www.assemblee-nationale.fr/dyn/${legislature}/dossiers/${titreChemin}`

  return (
    <div className="">
      <p>
        Titre : <span className="text-2xl">{titre}</span>
      </p>
      <p>xsiType : {dossier.xsiType}</p>
      <FusionDossier {...{ fusionDossier }} />
      <p>
        URL AN :{' '}
        <MyLink href={urlAn} targetBlank>
          {urlAn}
        </MyLink>
      </p>

      {senatChemin && (
        <p>
          URL sur le site du Sénat{' '}
          <MyLink href={senatChemin} targetBlank>
            {senatChemin}
          </MyLink>
        </p>
      )}

      <p>procédure parlementaire : {dossier.procedureParlementaire.libelle}</p>
      <p>Législature : {dossier.legislature}</p>
      <Initiateur {...{ initiateur }} />

      <ActeLegislatifs {...{ actesLegislatifs }} />
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
      <MyLink href={`/dossiers/${dossierAbsorbantRef}`}>
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
}: {
  actesLegislatifs: types.Props['dossier']['actesLegislatifs']
}) {
  if (actesLegislatifs) {
    return (
      <div className="p-4">
        {actesLegislatifs.map(childActe => {
          return <ActeLegislatifRacine key={childActe.uid} acte={childActe} />
        })}
      </div>
    )
  }
  return null
}
function ActeLegislatifRacine({ acte }: { acte: dossierTypes.ActeRacine }) {
  return (
    <div className="m-4 border-2 border-slate-300 bg-slate-200 p-4 shadow-lg">
      {acte.libelleActe.nomCanonique}

      {acte.actesLegislatifs.map(childActe => {
        return <ActeLegislatifNested key={childActe.uid} acte={childActe} />
      })}
    </div>
  )
}

function ActeLegislatifNested({ acte }: { acte: dossierTypes.ActeNested }) {
  const {
    xsiType,
    anneeDecision,
    auteurMotion,
    auteursRefs,
    casSaisine,
    codeLoi,
    dateActe,
  } = acte
  const libelleCasSaisine = casSaisine?.libelle

  return (
    <div className=" m-2 border-2 border-slate-300 bg-slate-200 p-2 shadow-lg">
      <div>
        {xsiType && (
          <>
            <span className="text-sm italic text-slate-500">{xsiType}</span>{' '}
          </>
        )}
        {anneeDecision && (
          <>
            <span className="text-sm font-bold ">({anneeDecision})</span>{' '}
          </>
        )}
        {acte.libelleActe.nomCanonique}
        {acte.actesLegislatifs?.map(childActe => {
          return <ActeLegislatifNested key={childActe.uid} acte={childActe} />
        })}
      </div>
      {auteurMotion && <p>Auteur de la motion {auteurMotion}</p>}
      {auteursRefs && <p>Références des auteurs {auteursRefs.join(', ')}</p>}
      {libelleCasSaisine && <p>Cas de saisine {libelleCasSaisine}</p>}
      {codeLoi && <p>Code loi {codeLoi}</p>}
      {dateActe && <p>Date {formatDate(dateActe)}</p>}
    </div>
  )
}
