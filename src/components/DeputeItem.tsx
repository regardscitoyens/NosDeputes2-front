import Link from 'next/link'
import { SimpleDepute } from '../services/deputesAndGroupesService'
import { GroupeBadgeWithFonction } from './GroupeBadge'
import { MyLink } from './MyLink'

type Props = {
  depute: SimpleDepute
  withCirco?: boolean
}

export function DeputeItem({
  depute: { slug, latestGroup, nom, nom_de_famille, nom_circo, mandatOngoing },
  withCirco,
}: Props) {
  const bg = mandatOngoing ? 'bg-slate-100' : 'bg-slate-200'
  const prenom = nom.replace(nom_de_famille, '').trim()
  return (
    <div className={`my-2 rounded p-2 drop-shadow ${bg}`}>
      <MyLink
        href={`/${slug}`}
        className={
          mandatOngoing
            ? 'font-normal'
            : 'font-normal text-slate-500 line-through'
        }
      >
        {nom_de_famille}, {prenom}
      </MyLink>
      <GroupeBadgeWithFonction groupe={latestGroup} />
      {withCirco && (
        <span className="bg-blue ml-1 cursor-pointer text-slate-400">
          {nom_circo}
        </span>
      )}
    </div>
  )
}
