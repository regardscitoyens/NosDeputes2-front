import Head from 'next/head'
import { ReactNode, useState } from 'react'
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
    <MyLink href={'/'} className={`block items-center py-2  uppercase`}>
      <p className="text-2xl text-slate-700">NosDéputés.fr</p>{' '}
      <p className="text-md text-slate-500 ">(relève)</p>
    </MyLink>
  )
}

function LogoMobile() {
  return (
    <MyLink
      href={'/'}
      className={`flex items-center justify-center px-2 uppercase`}
    >
      <p>
        <span className="text-xl text-slate-700">NosDéputés.fr</span>{' '}
        <span className="text-slate-500 ">(relève)</span>
      </p>
    </MyLink>
  )
}

function Division({
  classname,
  children,
}: {
  classname?: string
  children: ReactNode
}) {
  return (
    <div
      className={`mx-4 border-b border-slate-400 last:border-b-0 ${classname}`}
    >
      {children}
    </div>
  )
}

function SideMenu({ mobileMenuFolded }: { mobileMenuFolded: boolean }) {
  return (
    <nav
      className={`fixed flex  w-screen flex-col border-r border-slate-400 bg-slate-300 text-center  md:static md:w-72 ${
        mobileMenuFolded ? 'hidden md:block' : ''
      }`}
    >
      <Division classname="hidden md:block">
        <Logo />
      </Division>
      <Division>
        <MenuLink to="/deputes" label="Les députés" />
        <MenuLink to="/circonscription" label="Les circonscriptions" />
        <MenuLink to="/sessions" label="Les sessions parlementaires" />
        <MenuLink to="/seances" label="Les séances en hémicycle" />
        <MenuLink to="/dossiers" label="Les dossiers législatifs" />
        <MenuLink to="/scrutins" label="Les scrutins" />
      </Division>
      <Division>
        <MenuLink to="/faq" label="Questions fréquentes (FAQ)" />
        <MenuLink to="/mentions-legales" label="Mention légales" />
      </Division>
      <Division>
        <MenuLink to="/long" label="Page avec beaucoup de contenu" />
      </Division>
    </nav>
  )
}

function MobileTopBar({ toggleMobileMenu }: { toggleMobileMenu: () => void }) {
  return (
    <div className="fixed flex h-11 w-full bg-white md:hidden">
      <button
        className="m-1 rounded bg-slate-300 p-1"
        onClick={toggleMobileMenu}
      >
        hamburger
      </button>
      <LogoMobile />
    </div>
  )
}

function RestOfPage({ children }: Props) {
  return (
    <div className="grow bg-slate-300">
      <main className="container mx-auto flex  flex-col pt-4 pb-6">
        {children}
      </main>
    </div>
  )
}

export function Layout({ children }: Props) {
  const [mobileMenuFolded, setMobileMenuFolded] = useState(true)

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
      <div className="flex min-h-screen flex-col text-slate-800">
        <MobileTopBar
          toggleMobileMenu={() => {
            setMobileMenuFolded(v => !v)
          }}
        />
        <div className="mt-11 flex grow md:mt-0">
          <SideMenu {...{ mobileMenuFolded }} />
          <RestOfPage {...{ children }} />
        </div>
      </div>
    </>
  )
}
