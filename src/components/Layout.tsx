import Head from 'next/head'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
import { MyLink } from './MyLink'

type Props = {
  children: ReactNode
}

function MenuLink({
  to,
  label,
  className,
  wip = false,
}: {
  to: string
  label?: string
  className?: string
  wip?: boolean
}) {
  return (
    <MyLink
      href={to}
      className={`block py-4 text-lg ${wip ? 'text-sm' : ''} ${className}`}
      textColorClassOverride="text-slate-700"
    >
      {label ?? to}
      {wip ? <span className="text-amber-700"> (WIP)</span> : null}
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
      className={`fixed z-50 flex min-h-full w-screen flex-col border-r border-slate-400 bg-slate-300 text-center  lg:static lg:w-[250px] ${
        mobileMenuFolded ? 'hidden lg:block' : ''
      }`}
    >
      <Division classname="hidden lg:block">
        <Logo />
      </Division>
      <Division>
        <MenuLink to="/deputes" label="Les députés" />
        <MenuLink
          to="/historique-remplacements"
          label="Historique des départs et remplacements"
        />
      </Division>
      <Division>
        <MenuLink to="/circonscription" label="Les circonscriptions" wip />
        <MenuLink
          to="/commissions-permanentes"
          label="Les commissions permanentes"
          wip
        />
        <MenuLink to="/seances" label="Les séances en hémicycle" wip />
        <MenuLink to="/sessions" label="Les sessions parlementaires" wip />
        <MenuLink to="/dossiers" label="Les dossiers législatifs" wip />
        <MenuLink to="/scrutins" label="Les scrutins" wip />
      </Division>
      <Division>
        <MenuLink to="/long" label="Page avec beaucoup de contenu" wip />
        <MenuLink to="/short" label="Page avec très peu de contenu" wip />
      </Division>
    </nav>
  )
}

function MobileTopBar({ toggleMobileMenu }: { toggleMobileMenu: () => void }) {
  return (
    <div className="fixed z-50 flex h-11 w-full border-b-2 border-slate-400 bg-slate-300 lg:hidden">
      <button
        className="m-1  rounded  bg-slate-600 px-1 text-slate-300"
        onClick={toggleMobileMenu}
      >
        menu
      </button>
      <LogoMobile />
    </div>
  )
}

function RestOfPage({ children }: Props) {
  return (
    <div className="grow">
      <main className="z-0 mx-auto flex h-full w-full flex-col pt-2  pb-6 sm:w-[640px] md:w-[768px] xl:w-[1030px] 2xl:w-[1286px]">
        {children}
      </main>
    </div>
  )
}

export function Layout({ children }: Props) {
  const [mobileMenuFolded, setMobileMenuFolded] = useState(true)
  const router = useRouter()
  useEffect(() => {
    // fold menu when changing routes
    const handleRouteChange = () => {
      setMobileMenuFolded(true)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

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
      <div className="flex min-h-screen flex-col bg-slate-300 text-slate-700">
        <MobileTopBar
          toggleMobileMenu={() => {
            setMobileMenuFolded(v => !v)
          }}
        />
        <div className="mt-11 flex grow lg:mt-0">
          <SideMenu {...{ mobileMenuFolded }} />
          <RestOfPage {...{ children }} />
        </div>
      </div>
    </>
  )
}
