import { LATEST_LEGISLATURE, legislaturesData } from '../lib/hardcodedData'
import { MyLink } from './MyLink'

function findLegislatureData(legislature: number) {
  const data = legislaturesData.find(_ => _.num === legislature)
  if (!data) {
    throw new Error(`Missing legislature data for ${legislature}`)
  }
  return data
}

function CurrentLegislature({
  currentLegislature: legislature,
}: {
  currentLegislature: number
}) {
  const data = findLegislatureData(legislature)
  const isPast = legislature < LATEST_LEGISLATURE
  return (
    <>
      <p>
        <span className="text-lg font-bold">{data.datesLabel}</span>
      </p>
      <p
        className="
       text-slate-500"
      >
        {true
          ? `${legislature}ème législature de l'Assemblée Nationale`
          : `Législature actuelle (la ${legislature}ème) de l'Assemblée Nationale`}
        {isPast && (
          <>
            {' '}
            <span className=" font-bold uppercase text-orange-800">
              terminée
            </span>
          </>
        )}
      </p>
      <p className="italic text-slate-500">{data.presidentLabel}</p>
    </>
  )
}

function LegislatureLink({
  kind,
  currentLegislature,
  urlsByLegislature,
}: {
  kind: 'previous' | 'next'
  currentLegislature: number
  urlsByLegislature: [number, string][]
}) {
  const legislature = currentLegislature + (kind === 'next' ? 1 : -1)
  const url = urlsByLegislature.find(_ => _[0] === legislature)?.[1]
  if (url) {
    return (
      <MyLink href={url}>
        {kind === 'previous' && '← législature précédente'}
        {kind === 'next' && 'législature suivante →'}
      </MyLink>
    )
  }
  return null
}

export function LegislatureNavigation({
  currentLegislature,
  urlsByLegislature,
  title,
}: {
  title: string
  currentLegislature: number
  urlsByLegislature: [number, string][]
}) {
  return (
    <div className="mx-auto my-4 w-[52rem] rounded-xl bg-slate-200 pt-2 ">
      <h1 className="text-center text-4xl font-extrabold">{title}</h1>
      <div className="flex w-full">
        <div className="flex w-1/6 items-end justify-center  px-4 py-2 ">
          <LegislatureLink
            {...{ currentLegislature, urlsByLegislature }}
            kind="previous"
          />
        </div>
        <div className={`w-2/3 py-2 text-center `}>
          <CurrentLegislature {...{ currentLegislature }} />
        </div>
        <div className="flex w-1/6 items-end justify-center px-4 py-2 text-right">
          <LegislatureLink
            {...{ currentLegislature, urlsByLegislature }}
            kind="next"
          />
        </div>
      </div>
    </div>
  )
}
