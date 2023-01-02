import {
  InterExtractionObj,
  OneOrMany,
  ParagrapheObj,
  PointObj,
  TexteObj,
} from '../../lib/types/compterendu'
import { formatDateWithTimeAndWeekday } from '../../lib/utils'
import * as types from './SeanceFiche.types'

export function Page(props: types.Props) {
  const { seance, compteRendu } = props
  console.log('@@@@ seance', seance)
  console.log('@@@@ compteRendu', compteRendu)
  return (
    <div className="">
      <h1 className=" text-center text-2xl">
        Fiche de la séance du {formatDateWithTimeAndWeekday(seance.start_date)}
      </h1>
      {seance.ordre_du_jour && (
        <div>
          Ordre du jour :
          <pre>{JSON.stringify(seance.ordre_du_jour, null, 2)}</pre>
        </div>
      )}
      <h2 className="my-4 text-center text-xl">Compte rendu</h2>
      <DisplayPoints points={forceArray(compteRendu.contenu.point)} />
    </div>
  )
}

function DisplayPoints({ points }: { points: PointObj[] }) {
  return (
    <>
      {points.map((point, idx) => {
        return <DisplayPoint key={`point${idx}`} {...{ point }} />
      })}
    </>
  )
}

function DisplayPoint({ point }: { point: PointObj }) {
  const { texte, paragraphe, interExtraction, ...rest } = point
  return (
    <div className="m-2 border-2 border-solid border-slate-400 bg-slate-200 p-2 shadow-lg">
      <p className="text-sm font-bold text-slate-400">point</p>
      {texte && <DisplayTexte {...{ texte }} />}
      {paragraphe && (
        <DisplayParagraphes paragraphes={forceArray(paragraphe)} />
      )}
      {interExtraction && (
        <DisplayInterextractions
          interExtractions={forceArray(interExtraction)}
        />
      )}
      <pre>{JSON.stringify(rest, null, 2)}</pre>
    </div>
  )
}

function DisplayTexte({ texte }: { texte: PointObj['texte'] }) {
  if (!texte) return null
  return (
    <div>
      {typeof texte === 'string' ? texte : <DisplayTexteObj {...{ texte }} />}
    </div>
  )
}

function DisplayTexteObj({ texte }: { texte: TexteObj }) {
  return (
    <div className="m-2 border-2 border-solid border-slate-400 bg-slate-200 p-2 shadow-lg">
      <p className="text-sm font-bold text-slate-400">texte object</p>
      <pre>{JSON.stringify(texte, null, 2)}</pre>
    </div>
  )
}

function DisplayParagraphes({ paragraphes }: { paragraphes: ParagrapheObj[] }) {
  return (
    <>
      {paragraphes.map((paragraphe, idx) => {
        return (
          <DisplayParagraphe key={`paragraphe${idx}`} {...{ paragraphe }} />
        )
      })}
    </>
  )
}

function DisplayParagraphe({ paragraphe }: { paragraphe: ParagrapheObj }) {
  const { texte, ...rest } = paragraphe
  return (
    <div className="m-2 border-2 border-solid border-slate-400 bg-slate-200 p-2 shadow-lg">
      <p className="text-sm font-bold text-slate-400">paragraphe</p>
      <DisplayTexte {...{ texte }} />
      <pre>{JSON.stringify(rest, null, 2)}</pre>
    </div>
  )
}

function DisplayInterextractions({
  interExtractions,
}: {
  interExtractions: InterExtractionObj[]
}) {
  return (
    <>
      {interExtractions.map((interExtraction, idx) => {
        return (
          <DisplayInterextraction
            key={`interExtraction${idx}`}
            {...{ interExtraction }}
          />
        )
      })}
    </>
  )
}

function DisplayInterextraction({
  interExtraction,
}: {
  interExtraction: InterExtractionObj
}) {
  const { paragraphe, ...rest } = interExtraction
  return (
    <div className="m-2 border-2 border-solid border-slate-400 bg-slate-200 p-2 shadow-lg">
      <p className="text-sm font-bold text-slate-400">interExtraction</p>
      <DisplayParagraphes paragraphes={forceArray(paragraphe)} />
      <pre>{JSON.stringify(rest, null, 2)}</pre>
    </div>
  )
}

// Always present as an array, so that we can use it properly
function forceArray<A>(oneOrMany: OneOrMany<A>): A[] {
  if (Array.isArray(oneOrMany)) return oneOrMany
  return [oneOrMany]
}
