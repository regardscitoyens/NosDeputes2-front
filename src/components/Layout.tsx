import Head from 'next/head'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function Layout({ children }: Props) {
  return (
    <div>
      <Head>
        <title>
          NosDéputés.fr : Observatoire citoyen de l'activité parlementaire
        </title>
        {/* TODO revoir les métas, balises pour SEO, partage twitter, etc.
         */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>Nos deputes header</header>
      {children}
      <footer>Footer</footer>
    </div>
  )
}
