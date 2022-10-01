import Head from 'next/head'
import Link from 'next/link'
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
          <main className="grow px-8 py-8 text-slate-800 ">{children}</main>
          <footer className="rounded bg-slate-200 px-4 py-4 text-center">
            <p className="text-slate-400">Footer</p>
          </footer>
        </div>
      </div>
    </>
  )
}
