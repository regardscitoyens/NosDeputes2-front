import sortBy from 'lodash/sortBy'

export const FIRST_LEGISLATURE = 12
export const LATEST_LEGISLATURE = 16
export const FIRST_LEGISLATURE_FOR_REUNIONS_AND_SESSIONS = 15

// Legislatures 14 and before didn't have colors
// we hardcode them
// TODO remplir cette map. Pour cela, faire d'abord la page avec les membre de chaque groupe, comme ça on pourra facilement voir les correspondances approximatives entre les groupes d'une législature à l'autre
// ou ptêt faire un script avec la CLI pour automatiquement mesurer les degrés de ressemblance
// ou juste prendre les vieilles couleurs de NosDeputes
export const colorsForGroupsOldLegislatures: { [acronym: string]: string } = {
  NI: '#8D949A',
}

export function isCommissionPermanente(slug: string) {
  return [
    'commission-des-lois-constitutionnelles-de-la-legislation-et-de-l-administration-generale-de-la-republique',
    'commission-des-finances-de-l-economie-generale-et-du-controle-budgetaire',
    'commission-des-affaires-economiques',
    'commission-des-affaires-sociales',
    'commission-des-affaires-culturelles-et-de-l-education',
    'commission-des-affaires-etrangeres',
    'commission-du-developpement-durable-et-de-l-amenagement-du-territoire',
    'commission-de-la-defense-nationale-et-des-forces-armees',
  ].includes(slug)
}

// L'ordre serait peut-être déductible à partir des places dans l'hémicycle de chaque député ?
export const groupesDisplayOrder: string[] = [
  'LFI',
  'GDR',
  'SOC',
  'ECO',
  'LIOT',
  'REN',
  'MODEM',
  'HOR',
  'LR',
  'RN',
  'NI',
]
export const groupesDisplayOrderWithNewAcronyms: string[] = [
  'LFI-NUPES',
  'GDR-NUPES',
  'SOC',
  'ECOLO',
  'LIOT',
  'RE',
  'DEM',
  'HOR',
  'LR',
  'RN',
  'NI',
]

export function sortGroupes<A extends { acronym: string }>(
  groupes: A[],
  withNewAcronyms: boolean = false,
): A[] {
  return sortBy(groupes, _ =>
    (withNewAcronyms
      ? groupesDisplayOrderWithNewAcronyms
      : groupesDisplayOrder
    ).indexOf(_.acronym),
  )
}

// Colors copied from conf/app.yml in nosdeputes.fr
const GroupeColorsByAcronyme: { [k: string]: string } = {
  LFI: rgbToHex(204, 42, 70),
  GDR: rgbToHex(207, 77, 39),
  SOC: rgbToHex(255, 149, 145),
  ECO: rgbToHex(151, 215, 74),
  LIOT: rgbToHex(216, 226, 24),
  REN: rgbToHex(255, 200, 0),
  MODEM: rgbToHex(255, 152, 0),
  HOR: rgbToHex(55, 157, 200),
  LR: rgbToHex(78, 81, 212),
  RN: rgbToHex(19, 57, 62),
  NI: rgbToHex(165, 165, 165),
}

function rgbToHex(r: number, g: number, b: number) {
  function componentToHex(c: number) {
    var hex = c.toString(16)
    return hex.length == 1 ? '0' + hex : hex
  }
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

export function getColorForGroupeAcronym(acronym: string) {
  return GroupeColorsByAcronyme[acronym] ?? 'black'
}

export function addPrefixToDepartement(nomDepartement: string) {
  const prefixes: {
    [k: string]: "d'" | "de l'" | 'de la' | 'des' | 'du' | 'de'
  } = {
    Ain: "de l'",
    Aisne: "de l'",
    Allier: "de l'",
    'Alpes-de-Haute-Provence': 'des',
    'Alpes-Maritimes': 'des',
    Ardèche: "de l'",
    Ardennes: 'des',
    Ariège: "d'",
    Aube: "de l'",
    Aude: "de l'",
    Aveyron: "de l'",
    'Bas-Rhin': 'du',
    'Bouches-du-Rhône': 'des',
    Calvados: 'du',
    Cantal: 'du',
    Charente: 'de',
    'Charente-Maritime': 'de',
    Cher: 'du',
    Corrèze: 'de',
    'Corse-du-Sud': 'de',
    "Côte-d'Or": 'de',
    "Côtes-d'Armor": 'des',
    Creuse: 'de la',
    'Deux-Sèvres': 'des',
    Dordogne: 'de la',
    Doubs: 'du',
    Drôme: 'de la',
    Essonne: "de l'",
    Eure: "de l'",
    'Eure-et-Loir': "d'",
    Finistère: 'du',
    'Français établis hors de France': 'des',
    Gard: 'du',
    Gers: 'du',
    Gironde: 'de la',
    Guadeloupe: 'de',
    Guyane: 'de',
    'Haut-Rhin': 'du',
    'Haute-Corse': 'de',
    'Haute-Garonne': 'de la',
    'Haute-Loire': 'de la',
    'Haute-Marne': 'de la',
    'Haute-Saône': 'de la',
    'Haute-Savoie': 'de',
    'Haute-Vienne': 'de la',
    'Hautes-Alpes': 'des',
    'Hautes-Pyrénées': 'des',
    'Hauts-de-Seine': 'des',
    Hérault: "de l'",
    'Ille-et-Vilaine': "d'",
    Indre: "de l'",
    'Indre-et-Loire': "de l'",
    Isère: "de l'",
    Jura: 'du',
    Landes: 'des',
    'Loir-et-Cher': 'du',
    Loire: 'de la',
    'Loire-Atlantique': 'de',
    Loiret: 'du',
    Lot: 'du',
    'Lot-et-Garonne': 'du',
    Lozère: 'de la',
    'Maine-et-Loire': 'du',
    Manche: 'de la',
    Marne: 'de la',
    Martinique: 'de',
    Mayenne: 'de la',
    Mayotte: 'de',
    'Meurthe-et-Moselle': 'de',
    Meuse: 'de la',
    Morbihan: 'du',
    Moselle: 'de la',
    Nièvre: 'de la',
    Nord: 'du',
    'Nouvelle-Calédonie': 'de la',
    Oise: "de l'",
    Orne: "de l'",
    Paris: 'de',
    'Pas-de-Calais': 'du',
    'Polynésie Française': 'de la',
    'Puy-de-Dôme': 'du',
    'Pyrénées-Atlantiques': 'des',
    'Pyrénées-Orientales': 'des',
    Réunion: 'de la',
    Rhône: 'du',
    'Saint-Pierre-et-Miquelon': 'de',
    'Saint-Barthélemy et Saint-Martin': 'de',
    'Saône-et-Loire': 'de',
    Sarthe: 'de la',
    Savoie: 'de',
    'Seine-et-Marne': 'de',
    'Seine-Maritime': 'de',
    'Seine-Saint-Denis': 'de',
    Somme: 'de la',
    Tarn: 'du',
    'Tarn-et-Garonne': 'du',
    'Territoire-de-Belfort': 'du',
    'Territoire de Belfort': 'du',
    "Val-d'Oise": 'du',
    'Val-de-Marne': 'du',
    Var: 'du',
    Vaucluse: 'du',
    Vendée: 'de',
    Vienne: 'de la',
    Vosges: 'des',
    'Wallis-et-Futuna': 'de',
    Yonne: "de l'",
    Yvelines: 'des',
  }
  const prefix = prefixes[nomDepartement] ?? 'de'
  const space = prefix.endsWith(`'`) ? '' : ' '
  return `${prefix}${space}${nomDepartement}`
}

export type FonctionInOrganisme =
  keyof typeof fonctionsInOrganismeWithFeminineVersion

export const fonctionsInOrganismeWithFeminineVersion = {
  'président délégué': 'présidente délégué',
  'président de droit': 'présidente de droit',
  président: 'présidente',
  'co-président': 'co-présidente',
  'vice-président': 'vice-présidente',
  'deuxième vice-président': 'deuxième vice-présidente',
  questeur: 'questeure',
  secrétaire: null,
  'rapporteur général': 'rapporteure générale',
  rapporteur: 'rapporteure',
  'co-rapporteur': 'co-rapporteure',
  'chargé de mission': 'chargée de mission',
  'membre du bureau': null,
  'membre avec voix délibérative': null,
  'membre avec voix consultative': null,
  'membre de droit': null,
  'membre titulaire': null,
  'membre nommé': 'membre nommée',
  membre: null,
  'membre suppléant': 'membre suppléante',
  apparenté: 'apparentée',
} as const

export function normalizeFonctionInGroup(f: string): FonctionInGroupe {
  switch (f) {
    case 'présidente':
    case 'président':
      return 'president'
    case 'apparentée':
    case 'apparenté':
      return 'apparente'
    case 'membre':
      return 'membre'
    default:
      console.log('Warning: unknown fonction in groupe', f)
      return 'membre'
  }
}
export type FonctionInGroupe = 'president' | 'membre' | 'apparente'

// sorts des amendements
export const amendementsSorts = [
  'Adopté',
  'Indéfini',
  'Irrecevable',
  'Non soutenu',
  'Rejeté',
  'Retiré',
  'Retiré avant séance',
  'Tombe',
]
export type AmendementsSort = typeof amendementsSorts[number]
