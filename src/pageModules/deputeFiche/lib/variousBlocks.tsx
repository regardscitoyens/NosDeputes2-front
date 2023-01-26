import { MyLink } from '../../../components/MyLink'
import {
  GroupeBadge,
  GroupeBadgeWithFonction,
} from '../../../components/GroupeBadge'
import { Todo } from '../../../components/Todo'
import {
  addPrefixToCirconscription,
  isCommissionPermanente,
} from '../../../lib/hardcodedData'
import { DeputeResponsabilite } from '../../../lib/queryDeputeResponsabilites'
import {
  formatDate,
  getAge,
  getOrdinalSuffixFeminine,
} from '../../../lib/utils'
import * as types from '../DeputeFiche.types'

const f = formatDate

export function LegislaturesBlock({
  depute,
  legislature: currentLegislature,
}: types.Props) {
  const { legislatures } = depute
  const feminine = depute.gender === 'F'
  const feminineE = feminine ? 'e' : ''
  if (legislatures.length == 1) {
    return <p>C'est sa première législature</p>
  }
  const otherLegislatures = legislatures.filter(_ => _ != currentLegislature)
  if (
    otherLegislatures.length === 1 &&
    otherLegislatures[0] === currentLegislature - 1
  ) {
    return <p>Était déjà député(e) dans la législature précédente</p>
  }
  if (otherLegislatures.length === 1) {
    const otherLegislature = otherLegislatures[0]
    return (
      <p>
        A aussi été député{feminineE} dans la {otherLegislature}ème législature
      </p>
    )
  }

  return (
    <p>
      A aussi été député{feminineE} dans les{' '}
      {otherLegislatures.map(_ => `${_}ème`).join(', ')} législatures{' '}
    </p>
  )
}

function areDatesCloseEnough(
  a: string,
  b: string,
  toleranceInDays: number = 5,
) {
  const aTime = new Date(a).getTime()
  const bTime = new Date(b).getTime()
  const timeDifference = Math.abs(aTime - bTime)
  const toleranceInMilliseconds = toleranceInDays * 24 * 60 * 60 * 1000
  return timeDifference < toleranceInMilliseconds
}

function labelDateDebutMandat(
  date_debut: string,
  date_debut_legislature: string,
): string {
  const dateDebutIsDebutLegislature = areDatesCloseEnough(
    date_debut,
    date_debut_legislature,
  )
  return dateDebutIsDebutLegislature
    ? `début de la législature (${f(date_debut)})`
    : f(date_debut)
}

function labelDateFinMandat(
  date_fin: string | null,
  date_fin_legislature: string | null,
): string | null {
  const dateFinIsFinLegislature =
    date_fin_legislature !== null && date_fin === date_fin_legislature

  return date_fin
    ? dateFinIsFinLegislature
      ? `jusqu'à la fin de la législature (${f(date_fin)})`
      : `au ${f(date_fin)}`
    : null
}

export function MandatsBlock({
  depute,
  legislatureDates,
}: {
  depute: types.Depute
  legislatureDates: types.Props['legislatureDates']
}) {
  const mandats = depute.mandats_this_legislature
  if (mandats.length === 0) {
    // should not happen, but let's be safe
    return null
  }
  const lastMandat = mandats[mandats.length - 1]
  const previousMandats = mandats.filter(_ => _ != lastMandat)
  const { date_debut, date_fin } = lastMandat
  const { date_debut: date_debut_legislature, date_fin: date_fin_legislature } =
    legislatureDates

  const dateFinIsFinLegislature =
    date_fin_legislature !== null && date_fin === date_fin_legislature

  const labelDateFin = date_fin
    ? dateFinIsFinLegislature
      ? `jusqu'à la fin de la législature (${f(date_fin)})`
      : `au ${f(date_fin)}`
    : null
  const feminine = depute.gender === 'F'
  const feminineE = feminine ? 'e' : ''
  // Note : pour voir un cas d'un député avec 3 mandats dans la même législature :
  // cf alain-vidalies dans la legislature 14
  return (
    <div className="">
      <p>
        {date_fin
          ? `Était député${feminineE} du ${labelDateDebutMandat(
              date_debut,
              date_debut_legislature,
            )} ${labelDateFinMandat(date_fin, date_fin_legislature)}`
          : `Député${feminineE} depuis le ${labelDateDebutMandat(
              date_debut,
              date_debut_legislature,
            )}`}
      </p>
      {previousMandats.length === 1 && (
        <div>
          Était déjà en mandat dans cette législature du{' '}
          {labelDateDebutMandat(
            previousMandats[0].date_debut,
            date_debut_legislature,
          )}{' '}
          {labelDateFinMandat(
            previousMandats[0].date_fin,
            date_fin_legislature,
          )}
        </div>
      )}
      {previousMandats.length > 1 && (
        <div>
          Était déjà en mandat dans cette législature :
          <ul>
            {previousMandats.map(mandat => (
              <li key={mandat.uid}>
                Du{' '}
                {labelDateDebutMandat(
                  mandat.date_debut,
                  date_debut_legislature,
                )}{' '}
                {labelDateFinMandat(mandat.date_fin, date_fin_legislature)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function InformationsBlock(props: types.Props) {
  const { depute, legislatureDates } = props
  const age = getAge(depute.date_of_birth)
  const feminine = depute.gender === 'F'
  const feminineE = feminine ? 'e' : ''
  const mandats = depute.mandats_this_legislature
  if (mandats.length === 0) {
    // should not happen
    return null
  }
  const lastMandat = mandats[mandats.length - 1]
  const formerDepute = lastMandat.date_fin !== null
  return (
    <div className=" px-8 py-4">
      <h1 className="text-xl">
        <span className="font-bold">
          <GroupeBadge groupe={depute.latestGroup} marginLeft={false} />
          {depute.full_name}
        </span>{' '}
        {formerDepute ? 'était député' : 'Député'}
        {feminineE} de la {depute.circo_number}
        <sup>{getOrdinalSuffixFeminine(depute.circo_number)}</sup>{' '}
        circonscription {addPrefixToCirconscription(depute.circo_departement)}
      </h1>{' '}
      <div className="py-4">
        <ul className="list-none">
          <li>{age} ans</li>
          <li>
            Groupe
            <GroupeBadgeWithFonction
              groupe={depute.latestGroup}
              fullName
              bold
            />
          </li>
        </ul>
      </div>
      <MandatsBlock {...{ depute, legislatureDates }} />
      <LegislaturesBlock {...props} />
    </div>
  )
}

export function Amendements({ depute }: { depute: types.Depute }) {
  return (
    <div className="bg-slate-200 px-8 py-4 shadow-md">
      <h2 className="font-bold">Ses amendements</h2>
      <div className="py-4">
        <table className="table-auto">
          <thead>
            <tr>
              <th>-</th>
              <th>Proposés</th>
              <th>Signés</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(depute.amendements).map(key => (
              <tr key={key}>
                <td>{key}</td>
                <td align="center">{depute.amendements[key].proposes}</td>
                <td align="center">{depute.amendements[key].signes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <MyLink
          href={`https://www.assemblee-nationale.fr/dyn/16/amendements?auteur=${depute.uid}`}
          targetBlank
        >
          Consulter tous ses amendements
        </MyLink>
      </div>
    </div>
  )
}

function VotePosition({
  position,
}: {
  position: types.Depute['votes'][number]['position']
}) {
  const color =
    position === 'pour'
      ? 'text-green-700'
      : position === 'contre'
      ? 'text-red-700'
      : 'text-inherit'

  return <span className={`font-bold ${color}`}>{position}</span>
}

export function Votes({ depute }: { depute: types.Depute }) {
  const votes = depute.votes || []
  return (
    <div className="bg-slate-200 px-8 py-4 shadow-md">
      <h2 className="font-bold">Votes</h2>
      <div className="py-4"></div>
      {(votes.length && (
        <ul className="list-none">
          <b>Ses derniers votes:</b>
          <br />
          {votes.map(vote => (
            <li key={vote.scrutin_id}>
              {formatDate(vote.date)} :{' '}
              <VotePosition position={vote.position} />{' '}
              <MyLink href="#">{vote.titre}</MyLink>
            </li>
          ))}
        </ul>
      )) ||
        null}
    </div>
  )
}

const isResponsabiliteParlementaire = (responsabilite: DeputeResponsabilite) =>
  responsabilite.type === 'parlementaire'

export function Responsabilites({ depute }: { depute: types.Depute }) {
  const sections = [
    {
      title: 'Commission permanente',
      filter: (responsabilite: DeputeResponsabilite) =>
        isResponsabiliteParlementaire(responsabilite) &&
        isCommissionPermanente(responsabilite.slug),
    },
    {
      title: 'Missions parlementaires',
      filter: (responsabilite: DeputeResponsabilite) =>
        isResponsabiliteParlementaire(responsabilite) &&
        !isCommissionPermanente(responsabilite.slug),
    },
    {
      title: 'Fonctions judiciaires, internationales ou extra-parlementaires',
      filter: (responsabilite: DeputeResponsabilite) =>
        responsabilite.type === 'extra',
    },
    {
      title: "Groupes d'études et d'amitié",
      filter: (responsabilite: DeputeResponsabilite) =>
        responsabilite.type === 'groupes',
    },
  ]
  return (
    <div className="bg-slate-200 px-8 py-4 shadow-md">
      <h2 className="font-bold">Responsabilités</h2>
      <div className="py-4"></div>
      {sections.map(section => {
        const rows = depute.responsabilites.filter(section.filter)
        return (
          (rows.length && (
            <ul className="list-none" key={section.title}>
              <b>{section.title} :</b>
              <br />
              {rows.map(row => (
                <li key={row.slug}>
                  <MyLink href={`/organisme/${row.slug}`}>
                    {row.nom} {row.fonction && `(${row.fonction})`}
                  </MyLink>
                </li>
              ))}
            </ul>
          )) ||
          null
        )
      })}
    </div>
  )
}
