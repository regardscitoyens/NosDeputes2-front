import { FonctionInGroupe } from '../lib/addLatestGroup'
import { pickTextColor } from '../lib/utils'
import { MyLink } from './MyLink'

export function GroupeBadgeWithFonction({
  groupe,
  marginLeft,
  bold,
  fullName,
}: {
  groupe: {
    acronym: string
    nom: string
    fonction: FonctionInGroupe
    color: string
  } | null
  marginLeft?: boolean
  bold?: boolean
  fullName?: boolean
}) {
  if (groupe)
    return (
      <BaseGroupeBadge
        acronym={groupe.acronym}
        nom={groupe.nom}
        fonction={groupe.fonction}
        color={groupe.color}
        {...{ marginLeft, bold, fullName }}
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
  const fonctionLabel =
    fonction === 'Président'
      ? 'Président du groupe'
      : fonction === 'Membre apparenté'
      ? 'apparenté'
      : null
  return (
    <MyLink
      href={`/groupe/${acronym}`}
      className={`${
        marginLeft ? 'ml-2 ' : ''
      } mr-2 inline-block rounded-l py-1 px-2 `}
      style={{ background: color }}
      textColorClassOverride={pickTextColor(color)}
    >
      <span className={bold ? 'font-bold' : ''}>
        {fullName ? nom : acronym === 'NI' ? 'Non-inscrit' : acronym}
      </span>
      {fonctionLabel ? (
        <>
          {' '}
          <span className={`italic ${pickTextColor(color, true)}`}>
            ({fonctionLabel})
          </span>
        </>
      ) : null}
    </MyLink>
  )
}
