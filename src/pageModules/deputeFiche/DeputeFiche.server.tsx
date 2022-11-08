import { GetServerSideProps } from 'next'
import PHPUnserialize from 'php-unserialize'
import { addLatestGroupToDepute } from '../../lib/addLatestGroup'
import { db } from '../../lib/db'
import * as PageTypes from './DeputeFiche.types'

function parseMails(mails: string): string[] {
  return Object.values(PHPUnserialize.unserialize(mails)) as string[]
}

function parseCollaborateurs(
  collaborateursStr: string,
): PageTypes.DeputeCollaborateur[] {
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
}): PageTypes.DeputeUrls {
  const urls = [] as PageTypes.DeputeUrls
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
  data: PageTypes.Props
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

  const finalDepute: PageTypes.Depute = {
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
