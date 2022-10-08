/*
# groupes_infos: ['nom / acro / couleur(R,G,B) / legende / regexp_identifiante', ...]   USE DOUBLE QUOTES
  groupes_infos: >
    [
    "La France Insoumise - NUPES / LFI / 204,42,70 / France Insoumise (NUPES) / insoumise",
    "Gauche Démocrate et Républicaine - NUPES / GDR / 207,77,39 / PCF & ultramarins (NUPES) / gauche\s*d.*mocrate",
    "Socialistes et apparentés - NUPES / SOC / 255,149,145 / PS et divers gauche (NUPES) / socialiste",
    "Écologiste - NUPES / ECO / 151,215,74 / EELV (NUPES) / cologi",
    "Libertés, Indépendants, Outre-mer et Territoires / LIOT / 216,226,24 / Radicaux, centristes, régionalistes... / libertés|indépendants|territoires",
    "Renaissance / REN / 255,200,0 / LREM et proches (Majorité gouv.) / renaissance",
    "Démocrate / MODEM / 255,152,0 / MoDem et indépendants (Majorité gouv.) / démocrate|modem",
    "Horizons et apparentés / HOR / 55,157,200 / Horizons (Majorité gouv.) / horizons",
    "Les Républicains / LR / 78,81,212 / LR et UDI / les\s*r.*publicains",
    "Rassemblement National / RN / 19,57,62 / RN et patriotes / rassemblement|national",
    "Députés Non Inscrits / NI / 165,165,165 / Non-Inscrits (divers gauche à droite sans groupe) / inscrit|non\s*inscrit"
    ]

*/

export const GroupeColorsByAcronyme: { [k: string]: string } = {
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
