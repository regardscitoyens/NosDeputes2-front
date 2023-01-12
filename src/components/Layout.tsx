import Head from 'next/head'
import { ReactNode } from 'react'
import { LATEST_LEGISLATURE } from '../lib/hardcodedData'
import { MyLink } from './MyLink'

type Props = {
  children: ReactNode
}

function MenuLink({
  to,
  label,
  className,
}: {
  to: string
  label?: string
  className?: string
}) {
  return (
    <MyLink
      href={to}
      className={`block py-4 text-lg ${className}`}
      textColorClassOverride="text-slate-700"
    >
      {label ?? to}
    </MyLink>
  )
}

function Logo() {
  return (
    <MyLink href={'/'} className={`block  px-2 py-4 text-center uppercase`}>
      <p className="text-2xl text-slate-700">NosDéputés.fr</p>{' '}
      <p className="text-md text-slate-500 ">(relève)</p>
    </MyLink>
  )
}

function SideMenu() {
  return (
    <nav className="flex w-72 flex-col border-r border-slate-400 bg-slate-300 text-center">
      <div className="mx-4 border-b border-slate-400">
        <Logo />
      </div>
      <div className="mx-4 border-b border-slate-400">
        <MenuLink to="/deputes" label="Les députés" />
        <MenuLink to="/circonscription" label="Les circonscriptions" />
        <MenuLink to="/sessions" label="Les sessions parlementaires" />
        <MenuLink to="/seances" label="Les séances en hémicycle" />
        <MenuLink to="/dossiers" label="Les dossiers législatifs" />
        <MenuLink to="/scrutins" label="Les scrutins" />
      </div>
      <div className="mx-4">
        <MenuLink to="/faq" label="Questions fréquentes (FAQ)" />
        <MenuLink to="/mentions-legales" label="Mention légales" />
      </div>
    </nav>
  )
}

function RestOfPage({ children }: Props) {
  return (
    <div className="grow bg-slate-300 ">
      <main className="container mx-auto flex min-h-screen flex-col pt-4 pb-6">
        {children}
      </main>
    </div>
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
        {/* favicon commenté pour le moment car il m'embrouille dans mes onglets */}
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <div className="flex text-slate-800">
        <SideMenu />
        <RestOfPage {...{ children }} />
      </div>
    </>
  )
}
