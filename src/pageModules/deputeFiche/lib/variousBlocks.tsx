import { MyLink } from '../../../components/MyLink'
import { GroupeBadge } from '../../../components/GroupeBadge'
import { Todo } from '../../../components/Todo'
import {
  addPrefixToCirconscription,
  isCommissionPermanente,
} from '../../../lib/hardcodedData'
import { DeputeResponsabilite } from '../../../lib/queryDeputeResponsabilites'
import { formatDate, getAge } from '../../../lib/utils'
import * as types from '../DeputeFiche.types'

export function LegislaturesBlock({
  depute,
  legislature: currentLegislature,
}: types.Props) {
  const { legislatures } = depute
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
  return (
    <p>
      A aussi été député(e) dans les{' '}
      {otherLegislatures.map(_ => `${_}ème`).join(', ')} législatures{' '}
    </p>
  )
}

export function MandatsBlock({ depute }: { depute: types.Depute }) {
  const mandats = depute.mandats_this_legislature
  if (mandats.length === 0) {
    // should not happen, but let's be safe
    return null
  }
  const lastMandat = mandats[mandats.length - 1]
  const previousMandats = mandats.filter(_ => _ != lastMandat)

  const { date_debut, date_fin } = lastMandat
  const f = formatDate
  // Note : pour voir un cas d'un député avec 3 mandats dans la même législature :
  // cf alain-vidalies dans la legislature 14
  return (
    <div>
      <p>
        {date_fin
          ? `Était en mandat du ${f(date_debut)} au ${f(date_fin)}`
          : `Mandat en cours depuis le ${f(date_debut)}`}
      </p>
      {previousMandats.length > 0 && (
        <div>
          Était déjà en mandat dans cette législature :
          <ul>
            {previousMandats.map(mandat => (
              <li key={mandat.uid}>
                Du {f(mandat.date_debut)}
                {mandat.date_fin && ` au ${f(mandat.date_fin)}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Todo inline>
        S'il n'est plus en mandat, l'afficher clairement quelque part
      </Todo>
      <br />
      <Todo inline>
        Si un seul mandat précédent, l'afficher plus proprement (ne pas démarrer
        une liste avec 1 élément)
      </Todo>
      <br />
      <Todo inline>
        Afficher explicitement quand la date est depuis le début de la
        législature : "Est en mandat depuis le début de la législature
        (XX/XX/XXXX)"
      </Todo>
      <br />
      <Todo inline>
        Identifier les principales raisons de mandats fractionnés (départ au
        gouvernement, remplacement par le suppléant, etc.) et les afficher
        clairement avec wording dédié
      </Todo>
    </div>
  )
}

function getOrdinalSuffixFeminine(n: number) {
  return n === 1 ? 'ère' : `ème`
}

export function InformationsBlock(props: types.Props) {
  const { depute } = props
  const age = getAge(depute.date_of_birth)
  const dateNaissanceFormatted = formatDate(depute.date_of_birth)
  return (
    <div className="bg-slate-200  px-8 py-4 shadow-md">
      <h1 className="text-2xl">
        <span className="font-bold">
          {depute.full_name}
          <GroupeBadge groupe={depute.latestGroup} />
        </span>
        Député de la {depute.circo_number}
        <sup>{getOrdinalSuffixFeminine(depute.circo_number)}</sup>{' '}
        circonscription {addPrefixToCirconscription(depute.circo_departement)}
      </h1>{' '}
      <div className="py-4">
        <ul className="list-none">
          <li>
            Né(e) le {dateNaissanceFormatted} ({age} ans)
          </li>
          <li>
            Groupe
            <GroupeBadge groupe={depute.latestGroup} />
          </li>
        </ul>
      </div>
      <MandatsBlock {...{ depute }} />
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
      <Todo>Liens + lien vers tous ses votes</Todo>
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
