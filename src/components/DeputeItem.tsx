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
        <a>
          <span className="font-semibold">{nom}</span>{' '}
          <GroupeBadgeWithFonction groupe={groupe} />
          {withCirco && (
            <span className="bg-blue text-slate-400">{nom_circo}</span>
          )}
        </a>
      </Link>
    </div>
  )
}
