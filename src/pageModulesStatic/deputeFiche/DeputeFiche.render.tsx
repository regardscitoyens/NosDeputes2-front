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
  const { depute, legislature, legislatureNavigationUrls, legislatureDates } =
    props
  // console.log('@@@@ depute', depute)

  return (
    <div className="">
      <LegislatureNavigation
        title={`Fiche de ${depute.full_name}`}
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />

      <div className="grid grid-cols-12 gap-4 bg-slate-200">
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
      </div>

      {depute.stats && (
        <div className="col-span-full my-4 h-44 bg-slate-200 p-4 pb-8">
          <h2 className="text-center text-xl font-bold">
            Présences à l'Assemblée
          </h2>
          <StatsGraph stats={depute.stats} />
        </div>
      )}
      <ContactBlock {...{ depute }} />
      {/* <Responsabilites {...{ depute }} /> */}
    </div>
  )
}
