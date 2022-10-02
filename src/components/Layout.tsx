import Head from 'next/head'
import Link from 'next/link'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

function BasicLink({ to }: { to: string }) {
  return (
    <Link href={to}>
      <a className="block bg-slate-300 py-2 px-4 underline">{to}</a>
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
          <nav className="my-2 flex space-x-2 bg-slate-200 py-4 px-4">
            <BasicLink to="/" />
            <BasicLink to="/deputes" />
            <BasicLink to="/damien-abad" />
            <BasicLink to="/page-with-long-content" />
          </nav>
          <main className="grow px-8 py-8 text-slate-800 ">{children}</main>
          <footer className="rounded bg-slate-200 px-4 py-4 text-center">
            <p className="text-slate-400">Footer</p>
          </footer>
        </div>
      </div>
    </>
  )
}
