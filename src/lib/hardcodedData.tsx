import sortBy from 'lodash/sortBy'

export const LATEST_LEGISLATURE = 16
export const FIRST_LEGISLATURE_FOR_DEPUTES = 12
export const FIRST_LEGISLATURE_FOR_REUNIONS_AND_SESSIONS = 15
export const FIRST_LEGISLATURE_FOR_SCRUTINS = 14
export const FIRST_LEGISLATURE_FOR_DOSSIERS = 8

export const legislaturesData = [
  {
    num: 16,
    datesLabel: 'depuis juin 2022',
    presidentLabel: () => (
      <span>
        C'est celle qui correspond au second mandat de président d'
        <span className="font-bold">Emmanuel Macron</span>
      </span>
    ),
  },
  {
    num: 15,
    datesLabel: 'de juin 2017 à juin 2022',
    presidentLabel: () => (
      <span>
        C'est celle qui correspondait au premier mandat de président d'
        <span className="font-bold">Emmanuel Macron</span>
      </span>
    ),
  },
  {
    num: 14,
    datesLabel: 'de juin 2012 à juin 2017',
    presidentLabel: () => (
      <span>
        C'est celle qui correspondait à la présidence de{' '}
        <span className="font-bold">François Hollande</span>
      </span>
    ),
  },
  {
    num: 13,
    datesLabel: 'de juin 2007 à juin 2012',
    presidentLabel: () => (
      <span>
        C'est celle qui correspondait à la présidence de{' '}
        <span className="font-bold">Nicolas Sarkozy</span>
      </span>
    ),
  },
  {
    num: 12,
    datesLabel: 'de juin 2002 à juin 2007',
    presidentLabel: () => (
      <span>
        C'est celle qui correspond au second mandat de président de
        <span className="font-bold">Jacques Chirac</span>
      </span>
    ),
  },
  {
    num: 11,
    datesLabel: 'de juin 1997 à juin 2002',
    presidentLabel: () => (
      <span>
        C'est celle qui correspond à la seconde partie du premier mandat de
        président de
        <span className="font-bold">Jacques Chirac</span>
      </span>
    ),
  },
  {
    num: 10,
    datesLabel: 'de avril 1993 à avril 1997',
  },
  {
    num: 9,
    datesLabel: 'de juin 1988 à avril 1993',
  },
  {
    num: 8,
    datesLabel: "d'avril 1986 à mai 1988",
  },
]

// Legislatures 14 and before didn't have colors
// we hardcode them
// TODO remplir cette map. Pour cela, faire d'abord la page avec les membre de chaque groupe, comme ça on pourra facilement voir les correspondances approximatives entre les groupes d'une législature à l'autre
// ou ptêt faire un script avec la CLI pour automatiquement mesurer les degrés de ressemblance
// ou juste prendre les vieilles couleurs de NosDeputes
// ou ptêt aller voir sur le site de l'AN si on peut pas les retrouver manuellement
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

export function simplifyCommissionName(commissionFullName: string) {
  switch (commissionFullName) {
    case `Commission des finances, de l'économie générale et du contrôle budgétaire`:
      return 'Commission des finances'
    case `Commission de la défense nationale et des forces armées`:
      return 'Commission de la Défense'
    case `Commission des affaires économiques, de l'environnement et du territoire`:
    case `Commission des affaires économiques`:
      return 'Commission des affaires économiques'
    case `Commission des affaires culturelles, familiales et sociales`:
    case `Commission des affaires culturelles et de l'éducation`:
      return 'Commission des affaires culturelles'
    case `Commission du développement durable et de l'aménagement du territoire`:
      return 'Commission du développement durable'
    case `Commission des lois constitutionnelles, de la législation et de l'administration générale de la République`:
      return 'Commission des lois'
    case `Commission des affaires sociales`:
      return 'Commission des affaires sociales'
    case `Commission des affaires étrangères`:
      return 'Commission des affaires étrangères'
    default:
      return commissionFullName
  }
}

const groupesDisplayOrder: string[] = [
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

export function sortGroupes<A extends { acronym: string }>(groupes: A[]): A[] {
  return sortBy(groupes, _ => groupesDisplayOrder.indexOf(_.acronym))
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
    return hex.length == 1 ? 0 + hex : hex
  }
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

export function getColorForGroupeAcronym(acronym: string) {
  return GroupeColorsByAcronyme[acronym] ?? 'black'
}

export function addPrefixToCirconscription(nomDepartement: string) {
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

export const departements = {
  Ain: '1',
  Aisne: '2',
  Allier: '3',
  'Alpes-de-Haute-Provence': '4',
  'Hautes-Alpes': '5',
  'Alpes-Maritimes': '6',
  Ardèche: '7',
  Ardennes: '8',
  Ariège: '9',
  Aube: '10',
  Aude: '11',
  Aveyron: '12',
  'Bouches-du-Rhône': '13',
  Calvados: '14',
  Cantal: '15',
  Charente: '16',
  'Charente-Maritime': '17',
  Cher: '18',
  Corrèze: '19',
  "Côte-d'Or": '21',
  "Côtes-d'Armor": '22',
  Creuse: '23',
  Dordogne: '24',
  Doubs: '25',
  Drôme: '26',
  Eure: '27',
  'Eure-et-Loir': '28',
  Finistère: '29',
  Gard: '30',
  'Haute-Garonne': '31',
  Gers: '32',
  Gironde: '33',
  Hérault: '34',
  'Ille-et-Vilaine': '35',
  Indre: '36',
  'Indre-et-Loire': '37',
  Isère: '38',
  Jura: '39',
  Landes: '40',
  'Loir-et-Cher': '41',
  Loire: '42',
  'Haute-Loire': '43',
  'Loire-Atlantique': '44',
  Loiret: '45',
  Lot: '46',
  'Lot-et-Garonne': '47',
  Lozère: '48',
  'Maine-et-Loire': '49',
  Manche: '50',
  Marne: '51',
  'Haute-Marne': '52',
  Mayenne: '53',
  'Meurthe-et-Moselle': '54',
  Meuse: '55',
  Morbihan: '56',
  Moselle: '57',
  Nièvre: '58',
  Nord: '59',
  Oise: '60',
  Orne: '61',
  'Pas-de-Calais': '62',
  'Puy-de-Dôme': '63',
  'Pyrénées-Atlantiques': '64',
  'Hautes-Pyrénées': '65',
  'Pyrénées-Orientales': '66',
  'Bas-Rhin': '67',
  'Haut-Rhin': '68',
  Rhône: '69',
  'Haute-Saône': '70',
  'Saône-et-Loire': '71',
  Sarthe: '72',
  Savoie: '73',
  'Haute-Savoie': '74',
  Paris: '75',
  'Seine-Maritime': '76',
  'Seine-et-Marne': '77',
  Yvelines: '78',
  'Deux-Sèvres': '79',
  Somme: '80',
  Tarn: '81',
  'Tarn-et-Garonne': '82',
  Var: '83',
  Vaucluse: '84',
  Vendée: '85',
  Vienne: '86',
  'Haute-Vienne': '87',
  Vosges: '88',
  Yonne: '89',
  'Territoire-de-Belfort': '90',
  Essonne: '91',
  'Hauts-de-Seine': '92',
  'Seine-Saint-Denis': '93',
  'Val-de-Marne': '94',
  "Val-d'Oise": '95',
  'Français établis hors de France': '999',
  Guadeloupe: '971',
  Martinique: '972',
  Guyane: '973',
  Réunion: '974',
  'Saint-Pierre-et-Miquelon': '975',
  Mayotte: '976',
  'Saint-Barthélemy et Saint-Martin': '977',
  'Wallis-et-Futuna': '986',
  'Polynésie Française': '987',
  'Nouvelle-Calédonie': '988',
  'Corse-du-Sud': '2a',
  'Haute-Corse': '2b',
} as {
  [k: string]: string
}

export function getIdDepartement(nomDepartement: string) {
  return departements[nomDepartement] || ''
}

export function getNomDepartement(idDepartement: string) {
  const found = Object.entries(departements).filter(
    ([_, value]) => value === idDepartement,
  )
  return found && found[0][0]
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

// sorts des amendements
const amendementsSorts = [
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
