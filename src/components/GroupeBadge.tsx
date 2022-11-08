import Link from 'next/link'
import { getColorForGroupeAcronym } from '../lib/hardcodedData'
import { FonctionInGroupe } from '../lib/hardcodedData'
import { MyLink } from './MyLink'

export function GroupeBadgeWithFonction({
  groupe,
}: {
  groupe: { acronym: string; fonction: FonctionInGroupe } | null
}) {
  if (groupe)
    return (
      <BaseGroupeBadge acronym={groupe.acronym} fonction={groupe.fonction} />
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
    <MyLink
      href={`/groupe/${acronym}`}
      className={`mx-2 inline-block py-1 px-2 text-white`}
      style={{ background: getColorForGroupeAcronym(acronym) }}
    >
      {acronym}
      {fonction && fonction !== 'membre' ? ` (${fonction})` : null}
    </MyLink>
  )
}
