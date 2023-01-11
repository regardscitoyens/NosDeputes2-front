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
        <div className="container mx-auto flex min-h-screen  flex-col px-4">
          <header>
            <nav className="space-y-2 bg-slate-200 py-4 px-4">
              <div className="flex space-x-2 ">
                <MyLink href={'/'}>
                  <h1>
                    <span className="text-xl font-bold uppercase  text-slate-500">
                      NosDéputés.fr
                    </span>{' '}
                  </h1>
                  <p className=" text-md  text-center font-bold uppercase  text-slate-400 ">
                    (relève)
                  </p>
                </MyLink>
                <BasicLink to="/deputes" label="Les députés" />
                <BasicLink to="/circonscription" label="Les circonscriptions" />
                <BasicLink to="/sessions" label="Les sessions parlementaires" />
                <BasicLink to="/seances" label="Les séances en hémicycle" />
                <BasicLink to="/dossiers" label="Les dossiers législatifs" />
                <BasicLink to="/scrutins" label="Les scrutins" />
              </div>
            </nav>
          </header>
          <main className="grow text-slate-800 ">{children}</main>
          <footer className="mt-4 rounded bg-slate-200">
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
