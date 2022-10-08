import Head from 'next/head'
import Link from 'next/link'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

function BasicLink({ to, label }: { to: string; label?: string }) {
  return (
    <Link href={to}>
      <a className="block bg-slate-300 py-2 px-4 underline">{label ?? to}</a>
    </Link>
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
            <Link href={'/'}>
              <a>
                <h1 className="text-2xl font-bold uppercase text-slate-700">
                  NosDéputés.fr
                </h1>
                <p className="text-slate-500">
                  Observatoire citoyen de l'activité parlementaire
                </p>
              </a>
            </Link>
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
              <BasicLink to="/dossiers/date" label="Les dossiers" />
              <BasicLink to="/dossiers/coms" label="Les plus commentés" />
              <BasicLink to="/16/scrutins" label="Les scrutins publics" />
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
