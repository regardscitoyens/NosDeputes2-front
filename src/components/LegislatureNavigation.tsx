import { MyLink } from './MyLink'

export function LegislatureNavigation({
  currentLegislature,
  urlsByLegislature,
}: {
  currentLegislature: number
  urlsByLegislature: [number, string][]
}) {
  const previousLegislatureUrl =
    currentLegislature === undefined
      ? undefined
      : urlsByLegislature.find(_ => _[0] === currentLegislature - 1)?.[1]
  const nextLegislatureUrl =
    currentLegislature === undefined
      ? undefined
      : urlsByLegislature.find(_ => _[0] === currentLegislature + 1)?.[1]

  return (
    <div className="mb-4 flex bg-slate-200">
      <div className="w-1/3 py-2 text-center">
        {previousLegislatureUrl ? (
          <MyLink href={previousLegislatureUrl}>
            {'<'} Législature précédente
          </MyLink>
        ) : null}
      </div>
      <div className="w-1/3 py-2 text-center">
        {currentLegislature !== undefined ? (
          <>{currentLegislature}ème législature</>
        ) : null}
      </div>
      <div className="w-1/3 py-2 text-center">
        {nextLegislatureUrl ? (
          <MyLink href={nextLegislatureUrl}>Législature suivante {'>'}</MyLink>
        ) : null}
      </div>
    </div>
  )
}
