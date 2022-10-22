import Link from 'next/link'
import { SimpleDepute } from '../services/deputesService'
import { GroupeBadgeWithFonction } from './GroupeBadge'

type Props = {
  depute: SimpleDepute
  withCirco?: boolean
}

export function DeputeItem({
  depute: {
    slug,
    latestGroup,
    prenom,
    nom_de_famille,
    nom_circo,
    mandatOngoing,
  },
  withCirco,
}: Props) {
  const bg = mandatOngoing ? 'bg-slate-100' : 'bg-slate-200'
  const textClasses = mandatOngoing
    ? 'font-semibold'
    : 'font-normal text-slate-500 line-through'
  return (
    <div className={`my-2 rounded p-2 drop-shadow ${bg}`}>
      <Link href={`/${slug}`}>
        <a className={textClasses}>
          {nom_de_famille}, {prenom}
        </a>
      </Link>
      <GroupeBadgeWithFonction groupe={latestGroup} />
      {withCirco && (
        <span className="bg-blue ml-1 cursor-pointer text-slate-400">
          {nom_circo}
        </span>
      )}
    </div>
  )
}
