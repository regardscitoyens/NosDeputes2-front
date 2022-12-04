import { FonctionInGroupe } from '../lib/hardcodedData'
import { MyLink } from './MyLink'

export function GroupeBadgeWithFonction({
  groupe,
}: {
  groupe: { acronym: string; fonction: FonctionInGroupe; color: string } | null
}) {
  if (groupe)
    return (
      <BaseGroupeBadge
        acronym={groupe.acronym}
        fonction={groupe.fonction}
        color={groupe.color}
      />
    )
  else return null
}

export function GroupeBadge({
  groupe,
}: {
  groupe: { acronym: string; color: string } | null
}) {
  if (groupe)
    return <BaseGroupeBadge acronym={groupe.acronym} color={groupe.color} />
  else return null
}

function BaseGroupeBadge({
  acronym,
  fonction,
  color,
}: {
  acronym: string
  fonction?: FonctionInGroupe
  color: string
}) {
  return (
    <MyLink
      href={`/groupe/${acronym}`}
      className={`mx-2 inline-block py-1 px-2 `}
      style={{ background: color }}
      textColorClassOverride={color === '#F8D434' ? 'text-black' : 'text-white'}
    >
      {acronym}
      {fonction && fonction !== 'membre' ? ` (${fonction})` : null}
    </MyLink>
  )
}