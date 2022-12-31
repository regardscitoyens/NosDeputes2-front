export type PointOdjRawFromDb = {
  // there are other fields, but they don't seem useful
  uid: string
  typePointOdj: PointOdjType
  procedure?: PointOdjProcedure
  objet: string
  dossiersLegislatifsRefs?: [string]
  cycleDeVie: {
    etat: 'Annulé' | 'Confirmé' | 'Eventuel' | 'Supprimé'
  }
}

export type PointOdjFinal = {
  uid: string
  typePointOdj: PointOdjType
  procedure?: PointOdjProcedure
  objet: string
  dossierLegislatifRef?: string
}

export type PointOdjType =
  | 'Discussion'
  | "Débat d'initiative parlementaire"
  | "Déclaration du Gouvernement suivie d'un débat"
  | 'Explications de vote des groupes et vote par scrutin public'
  | "Fixation de l'ordre du jour"
  | 'Ouverture et clôture de session'
  | 'Questions au Gouvernement'
  | 'Questions orales sans débat'
  | 'Suite de la discussion'
  | 'Vote par scrutin public'
  | 'Vote solennel'

export type PointOdjProcedure =
  | 'discussion générale commune'
  | "procédure d'examen simplifiée-Article 103"
  | "procédure d'examen simplifiée-Article 106"
  | 'procédure de législation en commission-Article 107-1'

export function transformSeanceOdj(
  ordre_du_jour: PointOdjRawFromDb[] | null,
): PointOdjFinal[] {
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
