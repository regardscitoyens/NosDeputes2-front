import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import PHPUnserialize from 'php-unserialize'

import { GroupeBadge } from '../../components/GroupeBadge'
import { Todo } from '../../components/Todo'
import { MyLink } from '../../components/MyLink'
import {
  fetchDeputesList,
  SimpleDepute,
} from '../../services/deputesAndGroupesService'

import { addPrefixToDepartement } from '../../services/hardcodedData'
import { formatDate, getAge } from '../../services/utils'
import {
  DeputeCompleteInfo,
  queryDeputeForDeputePage,
} from '../../repositories/deputeRepository'

type Data = {
  depute: SimpleDepute & DeputeCompleteInfo
}

type DeputeUrls = { label: string; url: string }[]

function parseMails(basicDeputeInfo: DeputeCompleteInfo): string[] {
  if (basicDeputeInfo.mails) {
    return Object.values(
      PHPUnserialize.unserialize(basicDeputeInfo.mails),
    ) as string[]
  }
  return []
}

type DeputeCollaborateur = {
  name: string
}

function parseCollaborateurs(
  basicDeputeInfo: DeputeCompleteInfo,
): DeputeCollaborateur[] {
  if (basicDeputeInfo.collaborateurs) {
    const collaborateurs = Object.values(
      PHPUnserialize.unserialize(basicDeputeInfo.collaborateurs),
    ) as string[]
    // todo: resolve collaborateur link
    return collaborateurs.map(name => ({
      name,
    }))
  }
  return []
}

function parseAdresses(basicDeputeInfo: DeputeCompleteInfo): string[] {
  if (basicDeputeInfo.adresses) {
    return Object.values(
      PHPUnserialize.unserialize(basicDeputeInfo.adresses),
    ) as string[]
  }
  return []
}

// build list of depute urls
function parseDeputeUrls(basicDeputeInfo: DeputeCompleteInfo): DeputeUrls {
  const urls = [] as DeputeUrls
  if (basicDeputeInfo.url_an) {
    urls.push({
      label: 'Fiche Assemblée nationale',
      url: basicDeputeInfo.url_an,
    })
  }
  // todo: use real wikipedia url
  urls.push({
    label: 'Page wikipedia',
    url: `https://fr.wikipedia.org/wiki/${encodeURIComponent(
      basicDeputeInfo.nom,
    )}`,
  })
  if (basicDeputeInfo.sites_web) {
    const sites = PHPUnserialize.unserialize(basicDeputeInfo.sites_web) as {
      [k: string]: string
    }
    urls.push(
      ...Object.values(sites).map(url => {
        const label = url.match(/facebook/)
          ? 'Page facebook'
          : url.match(/twitter/)
          ? `Compte twitter : ${url.replace(/^.*\/(.*)$/, '@$1')}`
          : `Site web : ${url}`
        return {
          label,
          url,
        }
      }),
    )
  }
  return urls
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const slug = context.query.slug_or_legislature as string

  const basicDeputeInfo = await queryDeputeForDeputePage(slug)
  // we query everything, not ideal but acceptable for now
  // TODO rework that
  const deputeWithLatestGroup = (await fetchDeputesList()).find(
    _ => _.slug === slug,
  )
  if (!basicDeputeInfo || !deputeWithLatestGroup) {
    return {
      notFound: true,
    }
  }

  // add depute urls and contacts
  const basicDeputeInfoWithParsedInfos = {
    ...basicDeputeInfo,
    urls: parseDeputeUrls(basicDeputeInfo),
    collaborateurs_parsed: parseCollaborateurs(basicDeputeInfo),
    mails_parsed: parseMails(basicDeputeInfo),
    adresses_parsed: parseAdresses(basicDeputeInfo),
  }

  const data = {
    depute: {
      ...basicDeputeInfoWithParsedInfos,
      ...deputeWithLatestGroup,
    },
  }
  return {
    props: { data },
  }
}

function LinksBlock({ depute }: Data) {
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

function InformationsBlock({ depute }: Data) {
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

function ContactBlock({ depute }: Data) {
  console.log('depute', depute)
  return (
    <div className="bg-slate-200  px-8 py-4 shadow-md">
      <h2 className="font-bold">Contact</h2>
      <div className="py-4">
        {(depute.mails_parsed && depute.mails_parsed.length && (
          <ul className="list-none">
            <b>Par email :</b>
            <br />
            {depute.mails_parsed.map(mail => (
              <MyLink key={mail} targetBlank href={`mailto:${mail}`}>
                {mail}
              </MyLink>
            ))}
          </ul>
        )) ||
          null}
        {(depute.adresses_parsed && depute.adresses_parsed.length && (
          <ul className="list-none">
            <b>Par courrier :</b>
            <br />
            {depute.adresses_parsed.map(adresse => (
              <li key={adresse}>{adresse}</li>
            ))}
          </ul>
        )) ||
          null}
        {(depute.collaborateurs_parsed &&
          depute.collaborateurs_parsed.length && (
            <ul className="list-none">
              <b>Collaborateurs :</b>
              <br />
              {depute.collaborateurs_parsed.map(collaborateur => (
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

export default function Page({
  data: { depute },
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
        <img
          src={`/deputes/photos/16/${depute.id_an}.jpg`}
          alt={`Photo ${depute.sexe === 'F' ? `de la députée` : `du député`} ${
            depute.nom
          }`}
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
