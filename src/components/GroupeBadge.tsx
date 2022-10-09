import { GroupeForDepute } from '../logic/api'
import { getColorForGroupeAcronym } from '../logic/constants'

export function GroupeBadge({ groupe }: { groupe: GroupeForDepute | null }) {
  if (groupe) {
    const { acronym, fonction } = groupe
    const color = getColorForGroupeAcronym(acronym)
    return (
      <span
        className={`mx-2 inline-block py-1 px-2 text-white`}
        style={{ background: color }}
      >
        {groupe?.acronym} {fonction !== 'membre' ? `(${fonction})` : null}
      </span>
    )
  }
  return null
}
