import Head from 'next/head'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
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
      <div className="bg-slate-600">
        <div className="container mx-auto flex min-h-screen flex-col bg-slate-300 px-4 py-4">
          <header className="rounded bg-emerald-700 px-4 py-4">
            Nos deputes header
          </header>
          <main className="grow px-8 py-8">{children}</main>
          <footer className="rounded bg-emerald-700 px-4 py-4">Footer</footer>
        </div>
      </div>
    </>
  )
}
