import { FonctionInGroupe } from '../lib/newAddLatestGroup'
import { pickTextColor } from '../lib/utils'
import { MyLink } from './MyLink'

export function GroupeBadgeWithFonction({
  groupe,
  marginLeft,
  bold,
}: {
  groupe: {
    acronym: string
    nom: string
    fonction: FonctionInGroupe
    color: string
  } | null
  marginLeft?: boolean
  bold?: boolean
}) {
  if (groupe)
    return (
      <BaseGroupeBadge
        acronym={groupe.acronym}
        nom={groupe.nom}
        fonction={groupe.fonction}
        color={groupe.color}
        {...{ marginLeft, bold }}
      />
    )
  else return null
}

export function GroupeBadge({
  groupe,
  marginLeft,
  fullName,
  bold,
}: {
  groupe: { acronym: string; nom: string; color: string } | null
  marginLeft?: boolean
  fullName?: boolean
  bold?: boolean
}) {
  if (groupe)
    return (
      <BaseGroupeBadge
        acronym={groupe.acronym}
        nom={groupe.nom}
        color={groupe.color}
        {...{ marginLeft, fullName, bold }}
      />
    )
  else return null
}

function BaseGroupeBadge({
  acronym,
  nom,
  fonction,
  color,
  marginLeft = true,
  fullName = false,
  bold = false,
}: {
  acronym: string
  nom: string
  fonction?: FonctionInGroupe
  color: string
  marginLeft?: boolean
  fullName?: boolean
  bold?: boolean
}) {
  return (
    <MyLink
      href={`/groupe/${acronym}`}
      className={`${marginLeft ? 'ml-2 ' : ''} mr-2 inline-block py-1 px-2 `}
      style={{ background: color }}
      textColorClassOverride={pickTextColor(color)}
    >
      <span className={bold ? 'font-bold' : ''}>
        {fullName ? nom : acronym}
      </span>
      {fonction && fonction !== 'Membre' ? ` (${fonction})` : null}
    </MyLink>
  )
}
