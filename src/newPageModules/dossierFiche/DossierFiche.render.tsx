import { MyLink } from '../../components/MyLink'
import * as types from './DossierFiche.types'

export function Page(props: types.Props) {
  const { dossier } = props
  console.log('@@@@ dossier', dossier)

  const { legislature, titreDossier, initiateur, fusionDossier } = dossier
  const { titre, senatChemin, titreChemin } = titreDossier
  const urlAn = `http://www.assemblee-nationale.fr/dyn/${legislature}/dossiers/${titreChemin}`

  return (
    <div className="">
      <p>
        Titre : <span className="text-2xl">{dossier.titreDossier.titre}</span>
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
