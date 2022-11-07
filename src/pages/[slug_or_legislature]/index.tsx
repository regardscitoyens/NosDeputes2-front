import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import PHPUnserialize from 'php-unserialize'

import { GroupeBadge } from '../../components/GroupeBadge'
import { MyLink } from '../../components/MyLink'
import { Todo } from '../../components/Todo'
import {
  addLatestGroupToDepute,
  WithLatestGroup,
} from '../../services/addLatestGroup'

import { db } from '../../repositories/db'
import { addPrefixToDepartement } from '../../services/hardcodedData'
import { formatDate, getAge } from '../../services/utils'

type Data = { depute: LocalDepute }
type LocalDepute = WithLatestGroup<{
  id: number
  slug: string
  nom: string
  nom_circo: string
  num_circo: number
  date_naissance: string
  profession: string | null
  debut_mandat: string
  fin_mandat: string | null
  id_an: number
  sexe: 'H' | 'F'
  urls: { label: string; url: string }[]
  collaborateurs: { name: string }[]
  mails: string[]
  adresses: string[]
}>
type DeputeCollaborateur = { name: string }
type DeputeUrls = { label: string; url: string }[]

function parseMails(mails: string): string[] {
  return Object.values(PHPUnserialize.unserialize(mails)) as string[]
}

function parseCollaborateurs(collaborateursStr: string): DeputeCollaborateur[] {
  const collaborateurs = Object.values(
    PHPUnserialize.unserialize(collaborateursStr),
  ) as string[]
  // todo: resolve collaborateur link
  return collaborateurs.map(name => ({
    name,
  }))
}

function parseAdresses(adresses: string): string[] {
  return Object.values(PHPUnserialize.unserialize(adresses)) as string[]
}

function parseDeputeUrls(depute: {
  url_an: string
  sites_web: string | null
  nom: string
}): DeputeUrls {
  const urls = [] as DeputeUrls
  const { url_an, sites_web, nom } = depute
  urls.push({
    label: 'Fiche Assemblée nationale',
    url: url_an,
  })
  // todo: use real wikipedia url
  urls.push({
    label: 'Page wikipedia',
    url: `https://fr.wikipedia.org/wiki/${encodeURIComponent(nom)}`,
  })
  if (sites_web) {
    const sites = PHPUnserialize.unserialize(sites_web) as {
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

  const baseDepute = await db
    .selectFrom('parlementaire')
    .select([
      'id',
      'slug',
      'nom',
      'nom_circo',
      'num_circo',
      'date_naissance',
      'profession',
      'debut_mandat',
      'fin_mandat',
      'id_an',
      'sexe',
      'sites_web',
      'url_an',
      'collaborateurs',
      'mails',
      'adresses',
    ])
    .where('slug', '=', slug)
    .executeTakeFirst()
  if (!baseDepute) {
    return {
      notFound: true,
    }
  }
  // we query everything, not ideal but acceptable for now
  // TODO rework that
  const deputeWithLatestGroup = await addLatestGroupToDepute(baseDepute)

  const {
    url_an,
    sites_web,
    nom,
    collaborateurs,
    mails,
    adresses,
    ...restOfDepute
  } = deputeWithLatestGroup

  const finalDepute: LocalDepute = {
    ...restOfDepute,
    nom,
    urls: parseDeputeUrls({ url_an, sites_web, nom }),
    collaborateurs: parseCollaborateurs(collaborateurs),
    mails: parseMails(mails),
    adresses: parseAdresses(adresses),
    date_naissance: deputeWithLatestGroup.date_naissance.toISOString(),
    debut_mandat: deputeWithLatestGroup.debut_mandat.toISOString(),
    fin_mandat: deputeWithLatestGroup.fin_mandat?.toISOString() ?? null,
  }

  return {
    props: {
      data: {
        depute: finalDepute,
      },
    },
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
        {/* todo try to switch to next/image */}
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
