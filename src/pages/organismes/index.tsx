import Link from 'next/link'
import { ReactNode } from 'react'

function SimpleLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link {...{ href }}>
      <a className="block basis-1/4 bg-slate-200 px-2 py-2 text-center text-slate-600 underline ">
        {children}
      </a>
    </Link>
  )
}

export default function Page() {
  return (
    <>
      <h1 className="mb-4 text-center text-2xl">
        Liste des différents types d'organismes
      </h1>
      <div className="flex flex-row space-x-4">
        <SimpleLink href="/organismes/groupe">Groupes politiques</SimpleLink>
        <SimpleLink href="/organismes/parlementaire">
          Fonctions parlementaires (commissions, délégations, missions, ...)
        </SimpleLink>
        <SimpleLink href="/organismes/extra">
          Missions extra-parlementaires
        </SimpleLink>
        <SimpleLink href="/organismes/groupes">
          Groupes d'études et d'amitié
        </SimpleLink>
      </div>
    </>
  )
}
