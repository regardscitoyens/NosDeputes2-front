import * as seanceTypes from './types/seance'

export function transformSeanceOdj(
  ordre_du_jour: seanceTypes.PointOdjRawFromDb[] | null,
): seanceTypes.PointOdjFinal[] {
  return (ordre_du_jour ?? [])
    .filter(
      _ => _.cycleDeVie.etat !== 'Annulé' && _.cycleDeVie.etat !== 'Supprimé',
    )
    .map(_ => {
      return {
        uid: _.uid,
        typePointOdj: _.typePointOdj,
        ...(_.procedure ? { procedure: _.procedure } : null),
        objet: _.objet,
        ...(_.dossiersLegislatifsRefs
          ? { dossierLegislatifRef: _.dossiersLegislatifsRefs[0] }
          : null),
      }
    })
}
