import Image from 'next/image'

import { GroupeBadge } from '../../components/GroupeBadge'
import { Todo } from '../../components/Todo'
import {
  addPrefixToCirconscription,
  LATEST_LEGISLATURE,
} from '../../lib/hardcodedData'
import { ContactBlock } from './lib/ContactsBlock'
import * as types from './DeputeFiche.types'
import {
  Amendements,
  InformationsBlock,
  LegislaturesBlock,
  MandatsBlock,
  Responsabilites,
  Votes,
} from './lib/variousBlocks'
import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import { StatsGraph } from './lib/StatsGraph'
import { formatDate, getAge } from '../../lib/utils'

export function Page(props: types.Props) {
  const { depute, legislature, legislatureNavigationUrls } = props
  console.log('@@@@ depute', depute)
  const age = getAge(depute.date_of_birth)
  const dateNaissanceFormatted = formatDate(depute.date_of_birth)
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full">
        <LegislatureNavigation
          currentLegislature={legislature}
          urlsByLegislature={legislatureNavigationUrls}
        />
      </div>

      <div className="col-span-2">
        <Image
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
          <h2 className="text-center text-xl font-bold">Présences</h2>
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
