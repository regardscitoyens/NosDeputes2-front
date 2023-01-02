export type CompteRendu = {
  uid: string
  contenu: Contenu
  metadonnees: unknown
  seanceRef?: string
  sessionRef?: string
}

type Contenu = {
  point: OneOrMany<PointObj>
  quantiemes: unknown
  ouvertureSeance?: unknown
  finSeance?: unknown
  paragraphe?: unknown
  interExtraction?: unknown
}

export type PointObj = {
  texte?: string | TexteObj
  orateurs?: unknown
  point?: OneOrMany<PointObj>
  paragraphe?: OneOrMany<ParagrapheObj>
  interExtraction?: OneOrMany<InterExtractionObj>
  changementPresidence?: unknown
  vote?: unknown
}

export type TexteObj = {
  italique?: OneOrMany<string | ItaliqueObj>
  '#text'?: string
  exposant?: Exposant
  br?: Br
  indice?: number
}

export type ParagrapheObj = {
  texte: string | TexteObj
  orateurs: unknown
}

export type InterExtractionObj = {
  paragraphe: OneOrMany<ParagrapheObj>
  changementPresidence?: unknown
}

type Br = OneOrMany<string>
type Exposant = OneOrMany<string>

type ItaliqueObj = {
  br: Br
  '#text': string
}

// many fields are either some type, or an array of elements of the same type
export type OneOrMany<A> = A | A[]
