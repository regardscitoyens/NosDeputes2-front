import Link from 'next/link'
import { SimpleDepute } from '../logic/deputesService'
import { GroupeBadgeWithFonction } from './GroupeBadge'

type Props = {
  depute: SimpleDepute
  withCirco?: boolean
}

export function DeputeItem({
  depute: { slug, latestGroup, prenom, nom_de_famille, nom_circo },
  withCirco,
}: Props) {
  return (
    <div className="my-2 rounded bg-slate-100 p-2 drop-shadow">
      <Link href={`/${slug}`}>
        <a className="font-semibold">
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
