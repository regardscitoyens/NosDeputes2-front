import { MyLink } from '../../components/MyLink'
import { ActeLegislatif } from '../../lib/acteLegislatif'
import * as types from './DossierFiche.types'

export function Page(props: types.Props) {
  const { dossier, organes } = props
  // console.log('@@@@ dossier', dossier)
  console.log('@@@@ organes', organes)
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
  organes,
}: {
  actesLegislatifs: types.Props['dossier']['actesLegislatifs']
  organes: types.Organe[]
}) {
  if (actesLegislatifs) {
    return (
      <div className="p-4">
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
  const { xsiType, organeRef, libelleActe, actesLegislatifs } = acte
  const organe = findOrgane(organeRef, organes)
  return (
    <div className="m-2 border-2 border-slate-400 bg-slate-200 p-2 shadow-lg">
      {organe && <p className="text-slate-500">{organe.libelle}</p>}
      <p className="text-sm italic">{xsiType}</p>
      <p className="font-bold">{libelleActe}</p>
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
