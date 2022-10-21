import Link from 'next/link'
import { DeputeWithGroupe } from '../logic/apiDeputes'
import { SimpleDepute } from '../logic/deputesService'
import { GroupeBadgeWithFonction } from './GroupeBadge'

type Props = {
  depute: SimpleDepute
  withCirco?: boolean
}

export function DeputeItem({
  depute: { slug, latestGroup, nom, nom_circo },
  withCirco,
}: Props) {
  return (
    <div className="my-2 w-fit rounded bg-slate-100 p-2 drop-shadow">
      <Link href={`/${slug}`}>
        <a className="font-semibold">{nom}</a>
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
