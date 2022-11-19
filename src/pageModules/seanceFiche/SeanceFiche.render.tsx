import { Todo } from '../../components/Todo'
import { capitalizeFirst, formatDate } from '../../lib/utils'
import * as types from './SeanceFiche.types'
import {
  Intervention,
  InterventionSection,
  isInterventionParlementaire,
  isInterventionPersonnalite,
  isInterventionSection,
} from './SeanceFiche.types'
import { SeanceSummary } from '../../components/SeanceSummary'
import { MyLink } from '../../components/MyLink'
import { CURRENT_LEGISLATURE } from '../../lib/hardcodedData'
import Image from 'next/image'
import { ReactElement } from 'react'

function libelleSeance(seance: types.Props['seance']): string {
  return seance.type === 'commission' ? 'réunion' : 'séance'
}

export function Page({ seance, seanceSummary, interventions }: types.Props) {
  // TODO gestion de l'organisme
  return (
    <div>
      <h1 id="sommaire" className="text-center text-2xl">
        Séance en hémicycle du {formatDate(seance.date)} à {seance.moment}
      </h1>
      <h2 className="text-xl">Résumé de la {libelleSeance(seance)}</h2>
      <Todo>Graphe de répartition des temps de parole</Todo>
      <Todo>Mots clefs de la {libelleSeance(seance)}</Todo>
      <h3 className="text-xl">Sommaire</h3>
      <SeanceSummary seanceSummary={seanceSummary} />
      <div className="flex justify-between">
        <h2 className="text-xl">La {libelleSeance(seance)}</h2>
        {interventions.length > 0 ? (
          <MyLink targetBlank href={interventions[0].source}>
            Source
          </MyLink>
        ) : (
          <></>
        )}
      </div>
      <div>
        <Interventions seance={seance} interventions={interventions} />
      </div>
    </div>
  )
}

export function Interventions({
  seance,
  interventions,
}: Pick<types.Props, 'seance' | 'interventions'>) {
  // TODO gestion de la source de la seance ? d'où ça vient ?
  const source: string | undefined = undefined
  if ((seance.n_interventions ?? 0) == 0 && source) {
    if (source) {
      return (
        <p>
          Retrouvez le contenu de cette {libelleSeance(seance)}{' '}
          <MyLink targetBlank href={source}>
            sur le site de l'Assemblée nationale
          </MyLink>
        </p>
      )
    } else {
      return (
        <p>
          Le contenu de cette {libelleSeance(seance)} n'a pas encore été rendue
          publique par les services de l'Assemblée nationale
        </p>
      )
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      {interventions.map(intervention => {
        return (
          <InterventionComp
            key={intervention.md5}
            intervention={intervention}
          />
        )
      })}
    </div>
  )
}

function InterventionComp({ intervention }: { intervention: Intervention }) {
  if (isInterventionParlementaire(intervention)) {
    return (
      <InterventionPersonne
        intervention={intervention}
        Picture={
          <MyLink
            className="mr-4 flex-none"
            href={intervention.parlementaire.slug}
          >
            <Image
              src={`/deputes/photos/${CURRENT_LEGISLATURE}/${intervention.parlementaire.id_an}.jpg`}
              alt={`Photo de  ${intervention.parlementaire.nom}`}
              title={intervention.parlementaire.nom}
              width={55}
              height={70}
            />
          </MyLink>
        }
        Name={
          <MyLink href={`/${intervention.parlementaire.slug}`}>
            {intervention.parlementaire.nom}
            {intervention.fonction && `, ${intervention.fonction}`}
          </MyLink>
        }
      />
    )
  } else if (isInterventionPersonnalite(intervention)) {
    return (
      <InterventionPersonne
        intervention={intervention}
        Picture={
          <MyLink
            className="mr-4 flex-none"
            href={'https://commons.wikimedia.org/wiki/File:Unknown_person.jpg'}
            title={
              'Paulo Selke, CC BY-SA 4.0 &lt;https://creativecommons.org/licenses/by-sa/4.0&gt;, via Wikimedia Commons'
            }
          >
            <Image
              src={`/assets/unknown_person.jpg`}
              alt={"Une image qui remplace l'absence de photo"}
              title={intervention.personnalite.nom}
              width={55}
              height={70}
            />
          </MyLink>
        }
        Name={<span>{intervention.personnalite.nom}</span>}
      />
    )
  } else if (isInterventionSection(intervention)) {
    return <SectionTitle intervention={intervention} />
  } else {
    return <Didascalie intervention={intervention} />
  }
}

export function InterventionPersonne({
  intervention,
  Picture,
  Name,
}: {
  intervention: Intervention
  Picture: ReactElement
  Name: ReactElement
}) {
  return (
    <div
      id={`inter_${intervention.md5}`}
      className="flex rounded-lg bg-slate-200 p-2 shadow-lg"
    >
      {Picture}
      <div className="w-full">
        <div className="flex justify-between">
          {Name}
          <div>
            {intervention.parent_section_id && (
              <>
                <MyLink href={`#table_${intervention.parent_section_id}`}>
                  Début de section
                </MyLink>
                -
              </>
            )}
            <MyLink href={`#inter_${intervention.md5}`}>Permalien</MyLink>
          </div>
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: intervention.intervention,
          }}
        ></div>
      </div>
    </div>
  )
}

export function SectionTitle({
  intervention,
}: {
  intervention: InterventionSection
}) {
  const title =
    intervention.section.depth === 1 ? (
      <h2 className="text-center text-xl">
        {capitalizeFirst(intervention.section.titre)}
      </h2>
    ) : (
      <h3 className="text-center text-lg">
        {capitalizeFirst(intervention.section.titre)}
      </h3>
    )

  return (
    <div
      id={`table_${intervention.section_id}`}
      className="flex justify-between"
    >
      <div></div>
      {/* empty element for flex balance */}
      {title}
      <div>
        <MyLink href={`#sommaire`}>Retour au sommaire</MyLink>-
        <MyLink href={`#table_${intervention.section_id}`}>Permalien</MyLink>
      </div>
    </div>
  )
}

export function Didascalie({ intervention }: { intervention: Intervention }) {
  return (
    <div id={`inter_${intervention.md5}`} className="ml-16 italic">
      <div
        dangerouslySetInnerHTML={{
          __html: intervention.intervention,
        }}
      />
    </div>
  )
}
