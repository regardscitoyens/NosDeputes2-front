import { GetServerSideProps } from 'next'
import PHPUnserialize from 'php-unserialize'
import { addLatestGroupToDepute } from '../../lib/addLatestGroup'
import { queryDeputeAmendementsSummary } from '../../lib/queryDeputeAmendementsSummary'
import { queryDeputeResponsabilites } from '../../lib/queryDeputeResponsabilites'
import { queryDeputeVotes } from '../../lib/queryDeputeVotes'
import { dbLegacy } from '../../lib/dbLegacy'
import * as types from './DeputeFiche.types'

function parseMails(mails: string): string[] {
  const unserialized = PHPUnserialize.unserialize(mails)
  if (unserialized) {
    return Object.values(unserialized) as string[]
  }
  return []
}

function parseCollaborateurs(
  collaborateursStr: string,
): types.DeputeCollaborateur[] {
  const unserialized = PHPUnserialize.unserialize(collaborateursStr)
  if (unserialized) {
    const collaborateurs = Object.values(unserialized) as string[]
    // todo: resolve collaborateur link
    return collaborateurs.map(name => ({
      name,
    }))
  }
  return []
}

function parseAdresses(adresses: string): string[] {
  const unserialized = PHPUnserialize.unserialize(adresses)
  if (unserialized) {
    return Object.values(PHPUnserialize.unserialize(adresses)) as string[]
  }
  return []
}

function parseDeputeUrls(depute: {
  url_an: string
  sites_web: string | null
  nom: string
}): types.DeputeUrls {
  const urls = [] as types.DeputeUrls
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
    const unserialized = PHPUnserialize.unserialize(sites_web)
    if (unserialized) {
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
  }
  return urls
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const slug = context.query.slug_or_legislature as string

  const baseDepute = await dbLegacy
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
      'top',
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
    top,
    ...restOfDepute
  } = deputeWithLatestGroup

  const amendements = await queryDeputeAmendementsSummary(baseDepute.id)
  const responsabilites = await queryDeputeResponsabilites(baseDepute.id)
  const votes = await queryDeputeVotes(baseDepute.id, 5)

  const finalDepute: types.Depute = {
    ...restOfDepute,
    nom,
    top: PHPUnserialize.unserialize(top) as types.Metrics,
    urls: parseDeputeUrls({ url_an, sites_web, nom }),
    collaborateurs: parseCollaborateurs(collaborateurs),
    mails: parseMails(mails),
    adresses: parseAdresses(adresses),
    date_naissance: deputeWithLatestGroup.date_naissance.toISOString(),
    debut_mandat: deputeWithLatestGroup.debut_mandat.toISOString(),
    fin_mandat: deputeWithLatestGroup.fin_mandat?.toISOString() ?? null,
    amendements,
    responsabilites,
    votes,
  }

  return {
    props: {
      data: {
        depute: finalDepute,
      },
    },
  }
}
