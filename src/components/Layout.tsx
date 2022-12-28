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
              <BasicLink to="/circonscription" label="Les circonscription" />
              <BasicLink to="/sessions" label="Les sessions parlementaires" />
              <BasicLink to="/seances" label="Les séances en hémicycle" />
              <BasicLink to="/dossiers" label="Les dossiers législatifs" />
            </div>
          </nav>
          <main className="grow px-8 py-8 text-slate-800 ">{children}</main>
          <footer className="rounded bg-slate-200">
            <nav className="flex space-x-2  py-4 px-4">
              <BasicLink to="/faq" label="Questions fréquentes (FAQ)" />
              <BasicLink to="/mentions-legales" label="Mention légales" />
            </nav>
          </footer>
        </div>
      </div>
    </>
  )
}
