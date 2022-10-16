import Link from 'next/link'
import { DeputeWithGroupe } from '../logic/api'
import { GroupeBadgeWithFonction } from './GroupeBadge'

type Props = {
  depute: DeputeWithGroupe
  withCirco?: boolean
}

export function DeputeItem({
  depute: { slug, groupe, nom, nom_circo },
  withCirco,
}: Props) {
  return (
    <div className="my-2 w-fit rounded bg-slate-100 p-2 drop-shadow">
      <Link href={`/${slug}`}>
        <a className="font-semibold">{nom}</a>
      </Link>
      <GroupeBadgeWithFonction groupe={groupe} />
      {withCirco && (
        <span className="bg-blue ml-1 cursor-pointer text-slate-400">
          {nom_circo}
        </span>
      )}
    </div>
  )
}
