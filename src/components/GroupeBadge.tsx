import Link from 'next/link'
import { getColorForGroupeAcronym } from '../services/hardcodedData'
import { FonctionInGroupe } from '../repositories/deputesAndGroupesRepository'

export function GroupeBadgeWithFonction({
  groupe,
}: {
  groupe: { acronym: string; function: FonctionInGroupe } | null
}) {
  if (groupe)
    return (
      <BaseGroupeBadge acronym={groupe.acronym} fonction={groupe.function} />
    )
  else return null
}

export function GroupeBadge({
  groupe,
}: {
  groupe: { acronym: string } | null
}) {
  if (groupe) return <BaseGroupeBadge acronym={groupe.acronym} />
  else return null
}

function BaseGroupeBadge({
  acronym,
  fonction,
}: {
  acronym: string
  fonction?: FonctionInGroupe
}) {
  return (
    <Link href={`/groupe/${acronym}`}>
      <a
        className={`mx-2 inline-block py-1 px-2 text-white`}
        style={{ background: getColorForGroupeAcronym(acronym) }}
      >
        {acronym}
        {fonction && fonction !== 'membre' ? ` (${fonction})` : null}
      </a>
    </Link>
  )
}
