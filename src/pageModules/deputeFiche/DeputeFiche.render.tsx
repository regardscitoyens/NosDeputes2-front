import Image from 'next/image'

import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import { Todo } from '../../components/Todo'
import { LATEST_LEGISLATURE } from '../../lib/hardcodedData'
import { formatDate, getAge } from '../../lib/utils'
import * as types from './DeputeFiche.types'
import { ContactBlock } from './lib/ContactsBlock'
import { StatsGraph } from './lib/StatsGraph'
import {
  Amendements,
  InformationsBlock,
  Responsabilites,
  Votes,
} from './lib/variousBlocks'

export function Page(props: types.Props) {
  const { depute, legislature, legislatureNavigationUrls } = props
  console.log('@@@@ depute', depute)
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full">
        <LegislatureNavigation
          title={depute.full_name}
          currentLegislature={legislature}
          urlsByLegislature={legislatureNavigationUrls}
        />
      </div>
      <div
        className="col-span-2 flex 
    h-full items-center justify-center"
      >
        <Image
          className="shadow-lg"
          src={`/deputes/photos/${LATEST_LEGISLATURE}/${depute.uid.substring(
            2,
          )}.jpg`}
          alt={`Photo du (de la) député(e)} ${depute.full_name}`}
          width={150}
          height={192}
        />
      </div>
      <div className="col-span-10">
        <InformationsBlock {...props} />
      </div>

      {depute.stats && (
        <div className="col-span-full my-4 h-36">
          <h2 className="text-center text-xl font-bold">
            Présences à l'Assemblée
          </h2>
          <StatsGraph stats={depute.stats} />
        </div>
      )}
      <div className="col-span-full grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-8">
          <ContactBlock {...{ depute }} />
          <Responsabilites {...{ depute }} />
          <Todo>
            Ses interventions : (travaux en commissions, travaux en hémicycle,
            toutes ses interventions)
          </Todo>
          <Amendements {...{ depute }} />
        </div>
        <div className="space-y-8">
          <Todo>
            "Suivre l'activité du député" par email/rss/widget à embarquer
          </Todo>
          <Todo>Champ lexical (nuage de mots)</Todo>
          <Todo>
            Productions parlementaires (ses derniers rapports/props de lois)
          </Todo>
          <Votes {...{ depute }} />
          <Todo>
            Questions au gouvernement (ses dernieres questions orales, écrites)
          </Todo>
          <Todo>Historique des fonctions et mandats</Todo>
        </div>
      </div>
    </div>
  )
}
