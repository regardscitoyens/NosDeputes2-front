import Head from 'next/head'
import { ReactNode } from 'react'
import { LATEST_LEGISLATURE } from '../lib/hardcodedData'
import { MyLink } from './MyLink'

type Props = {
  children: ReactNode
}

function BasicLink({ to, label }: { to: string; label?: string }) {
  return (
    <MyLink href={to} className="block px-4">
      {label ?? to}
    </MyLink>
  )
}

export function Layout({ children }: Props) {
  return (
    <>
      <Head>
        <title>
          NosDéputés.fr : Observatoire citoyen de l'activité parlementaire
        </title>
        {/* TODO il faudra repasser sur les métas, balises pour SEO, partage twitter, etc.
         */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-slate-300">
        <div className="container mx-auto flex min-h-screen flex-col  px-4 py-4">
          <header className="rounded bg-slate-200 px-4 py-4 ">
            <MyLink href={'/'}>
              <h1 className="text-2xl font-bold uppercase text-slate-700">
                NosDéputés.fr
              </h1>
              <p className="text-slate-500">
                Observatoire citoyen de l'activité parlementaire
              </p>
            </MyLink>
          </header>
          <nav className="my-2 space-y-2 bg-slate-200 py-4 px-4">
            <div className="flex space-x-2">
              <BasicLink to="/deputes" label="Les députés" />
              <BasicLink to="/circonscription" label="Par circonscription" />
              <BasicLink to="/organismes" label="Par organisme" />
              <BasicLink to="/deputes/tags" label="Par mot clé" />
              <BasicLink to="/synthese" label="Synthese" />
              <BasicLink to="/hasard" label="Au hasard" />
            </div>
            <div className="flex space-x-2">
              <BasicLink
                to="/dossiers/date"
                label="Les dossiers (les derniers dossiers)"
              />
              <BasicLink to="/dossiers/plus" label="Les plus discutés" />
              <BasicLink
                to={`/${LATEST_LEGISLATURE}/scrutins`}
                label="Les scrutins publics"
              />
            </div>
            <div className="flex space-x-2">
              <BasicLink to="/recherche/foobar" label="Recherche" />
            </div>
          </nav>
          <main className="grow px-8 py-8 text-slate-800 ">{children}</main>
          <footer className="rounded bg-slate-200">
            <nav className="flex space-x-2  py-4 px-4">
              <BasicLink to="/faq" label="Questions fréquentes (FAQ)" />
              <BasicLink
                to="/assister-aux-debats"
                label="Assister aux débats"
              />
              <BasicLink
                to="/donnees"
                label="Données (dont api, dumps, etc.)"
              />
              <BasicLink
                to="/to-be-defined"
                label="Législature précédente/suivante"
              />
              <BasicLink to="/mentions-legales" label="Mention légales" />
              <BasicLink to="/nous-contacter" label="Nous contacter" />
              <BasicLink
                to="https://www.regardscitoyens.org"
                label="Regards citoyens"
              />
            </nav>
          </footer>
        </div>
      </div>
    </>
  )
}
