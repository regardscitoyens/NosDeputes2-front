import Image from 'next/image'

import { GroupeBadge } from '../../components/GroupeBadge'
import { MyLink } from '../../components/MyLink'
import { Todo } from '../../components/Todo'

import {
  addPrefixToDepartement,
  CURRENT_LEGISLATURE,
} from '../../lib/hardcodedData'
import { formatDate, getAge } from '../../lib/utils'
import * as types from './DeputeFiche.types'

function LinksBlock({ depute }: types.Props) {
  return (
    (depute.urls && (
      <ul className="list-none">
        {depute.urls.map(({ label, url }) => {
          return (
            <li key={url}>
              <MyLink targetBlank href={url}>
                {label}
              </MyLink>
            </li>
          )
        })}
      </ul>
    )) ||
    null
  )
}

function InformationsBlock({ depute }: types.Props) {
  const age = getAge(depute.date_naissance)
  const dateNaissanceFormatted = formatDate(depute.date_naissance)
  const mandatStartFormatted = formatDate(depute.debut_mandat)
  return (
    <div className="bg-slate-200  px-8 py-4 shadow-md">
      <h2 className="font-bold">Informations</h2>
      <div className="py-4">
        <ul className="list-none">
          <li>
            {depute.fin_mandat
              ? `Était en mandat du ${mandatStartFormatted} au ${formatDate(
                  depute.fin_mandat,
                )}`
              : `Mandat en cours depuis le ${mandatStartFormatted}`}
          </li>
          <li>
            Né(e) le {dateNaissanceFormatted} ({age} ans)
          </li>
          <li>Profession : {depute.profession ?? 'Non renseignée'}</li>
          <li>
            Groupe
            <GroupeBadge groupe={depute.latestGroup} />
          </li>
        </ul>
        <LinksBlock depute={depute} />
      </div>
    </div>
  )
}

function ContactBlock({ depute }: types.Props) {
  return (
    <div className="bg-slate-200  px-8 py-4 shadow-md">
      <h2 className="font-bold">Contact</h2>
      <div className="py-4">
        {(depute.mails.length && (
          <ul className="list-none">
            <b>Par email :</b>
            <br />
            {depute.mails.map(mail => (
              <MyLink key={mail} targetBlank href={`mailto:${mail}`}>
                {mail}
              </MyLink>
            ))}
          </ul>
        )) ||
          null}
        {(depute.adresses.length && (
          <ul className="list-none">
            <b>Par courrier :</b>
            <br />
            {depute.adresses.map(adresse => (
              <li key={adresse}>{adresse}</li>
            ))}
          </ul>
        )) ||
          null}
        {(depute.collaborateurs.length && (
          <ul className="list-none">
            <b>Collaborateurs :</b>
            <br />
            {depute.collaborateurs.map(collaborateur => (
              <li key={collaborateur.name}>{collaborateur.name}</li>
            ))}
          </ul>
        )) ||
          null}
      </div>
    </div>
  )
}

function getOrdinalSuffixFeminine(n: number) {
  return n === 1 ? 'ère' : `ème`
}

export function Page({ depute }: types.Props) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <h1 className="col-span-full  text-center text-2xl">
        <span className="font-bold">
          {depute.nom}
          <GroupeBadge groupe={depute.latestGroup} />
        </span>
        député de la {depute.num_circo}
        <sup>
          {getOrdinalSuffixFeminine(depute.num_circo)}
        </sup> circonscription {addPrefixToDepartement(depute.nom_circo)}
      </h1>
      <div className="col-span-2">
        <Image
          src={`/deputes/photos/${CURRENT_LEGISLATURE}/${depute.id_an}.jpg`}
          alt={`Photo ${depute.sexe === 'F' ? `de la députée` : `du député`} ${
            depute.nom
          }`}
          width={150}
          height={192}
        />
      </div>
      <div className="col-span-10">
        <Todo>graph de présence et participation</Todo>
      </div>
      <div className="col-span-full">
        <Todo>petite barre "Activité" avec diverses stats</Todo>
      </div>

      <div className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-8">
          <InformationsBlock {...{ depute }} />
          <ContactBlock {...{ depute }} />
          <Todo>
            Responsabilités (commissions, missions, groupes extraparlementaires
            etc.)
          </Todo>
          <Todo>
            Travaux législatifs : ses derniers dossiers, interventions,
            amendements (dont stats sur tous ses amendements)
          </Todo>
        </div>
        <div className="space-y-8">
          <Todo>
            "Suivre l'activité du député" par email/rss/widget à embarquer
          </Todo>
          <Todo>Champ lexical (nuage de mots)</Todo>
          <Todo>
            Productions parlementaires (ses derniers rapports/props de lois)
          </Todo>
          <Todo>Votes (ses derniers votes)</Todo>
          <Todo>
            Questions au gouvernement (ses dernieres questions orales, écrites)
          </Todo>
          <Todo>Historique des fonctions et mandats</Todo>
        </div>
      </div>
    </div>
  )
}
