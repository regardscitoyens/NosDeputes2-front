import { GroupeBadgeWithFonction } from './GroupeBadge'
import { MyLink } from './MyLink'
import { FonctionInGroupe } from '../lib/newAddLatestGroup'
import { LATEST_LEGISLATURE } from '../lib/hardcodedData'

type Props = {
  depute: {
    fullName: string
    circoDepartement: string
    slug: string | null
    mandatOngoing: boolean
    latestGroup: {
      acronym: string
      fonction: FonctionInGroupe
      color: string
    } | null
  }
  legislature: number
  displayCirco?: boolean
}

export function DeputeItem({
  depute: { slug, latestGroup, fullName, circoDepartement, mandatOngoing },
  legislature,
  displayCirco,
}: Props) {
  const bg = mandatOngoing ? 'bg-slate-100' : 'bg-slate-200'
  return (
    <div className={`my-2 rounded p-2 drop-shadow ${bg}`}>
      <>
        {slug ? (
          <MyLink
            href={`/${slug}${
              legislature !== LATEST_LEGISLATURE ? `/${legislature}` : ''
            }`}
            className={
              mandatOngoing
                ? 'font-normal'
                : 'font-normal text-slate-500 line-through'
            }
          >
            {fullName}
          </MyLink>
        ) : (
          fullName
        )}
      </>
      <GroupeBadgeWithFonction groupe={latestGroup} />
      {displayCirco && (
        <span className="bg-blue ml-1 cursor-pointer text-slate-400">
          {circoDepartement}
        </span>
      )}
    </div>
  )
}
