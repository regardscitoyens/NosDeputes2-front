import { Todo } from '../../components/Todo'
import { capitalizeFirst, formatDate } from '../../lib/utils'
import * as types from './SeanceFiche.types'
import {
  hasSectionTitre,
  Intervention,
  InterventionParlementaire,
  InterventionPersonnalite,
  InterventionWithSectionTitre,
  isInterventionParlementaire,
  isInterventionPersonnalite,
} from './SeanceFiche.types'
import { SeanceSummary } from '../../components/SeanceSummary'
import { MyLink } from '../../components/MyLink'
import { CURRENT_LEGISLATURE } from '../../lib/hardcodedData'
import Image from 'next/image'
import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'

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
          <MyLink targetBlank href={interventions[0].intervention_source}>
            Source
          </MyLink>
        ) : (
          <></>
        )}
      </div>
      <div>
        <Interventions
          seance={seance}
          interventions={interventions}
          seanceSummary={seanceSummary}
        />
      </div>
    </div>
  )
}

export function Interventions({
  seance,
  interventions,
  seanceSummary,
}: Pick<types.Props, 'seance' | 'interventions' | 'seanceSummary'>) {
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

  // Find first interventionId for each sectionId => gives the sections titles
  const interventionIdBySectionId: { [sectionId: string]: number } = mapValues(
    groupBy(
      interventions,
      intervention => intervention.intervention_section_id,
    ),
    interventionsForSection => interventionsForSection[0].intervention_id,
  )
  function sectionDepth(sectionId: number): 1 | 2 {
    return seanceSummary.sections.find(
      topSection => topSection.id === sectionId,
    )
      ? 1
      : 2
  }
  function isSectionIntervention(intervention: Intervention): boolean {
    return (
      intervention.intervention_section_id !== null &&
      intervention.intervention_id ===
        interventionIdBySectionId[
          intervention.intervention_section_id.toString()
        ]
    )
  }

  function InterventionComp({
    intervention,
    currentSectionId,
  }: {
    intervention: Intervention
    currentSectionId: number | null
  }) {
    if (isInterventionParlementaire(intervention)) {
      return (
        <InterventionParlementaireComp
          intervention={intervention}
          currentSectionId={currentSectionId}
        />
      )
    } else if (isInterventionPersonnalite(intervention)) {
      return (
        <InterventionPersonnaliteComp
          intervention={intervention}
          currentSectionId={currentSectionId}
        />
      )
    } else if (
      hasSectionTitre(intervention) &&
      isSectionIntervention(intervention)
    ) {
      return (
        <SectionTitle
          intervention={intervention}
          depth={sectionDepth(intervention.intervention_section_id)}
        />
      )
    } else {
      return <Didascalie intervention={intervention} />
    }
  }

  let currentSectionId: number | null = null
  return (
    <div className="flex flex-col space-y-6">
      {interventions.map(intervention => {
        // pas joli de faire un effet de bord comme ça :/
        if (isSectionIntervention(intervention)) {
          currentSectionId = intervention.intervention_section_id
        }

        return (
          <InterventionComp
            key={intervention.intervention_md5}
            intervention={intervention}
            currentSectionId={currentSectionId}
          />
        )
      })}
    </div>
  )
}

export function InterventionParlementaireComp({
  intervention,
  currentSectionId,
}: {
  intervention: InterventionParlementaire
  currentSectionId: number | null
}) {
  return (
    <div
      id={`inter_${intervention.intervention_md5}`}
      className="flex rounded-lg bg-slate-200 p-2 shadow-lg"
    >
      <MyLink className="mr-4 flex-none" href={intervention.parlementaire_slug}>
        <Image
          src={`/deputes/photos/${CURRENT_LEGISLATURE}/${intervention.parlementaire_id_an}.jpg`}
          alt={`Photo de  ${intervention.parlementaire_nom}`}
          title={intervention.parlementaire_nom}
          width={55}
          height={70}
        />
      </MyLink>
      <div className="w-full">
        <div className="flex justify-between">
          <MyLink href={`/${intervention.parlementaire_slug}`}>
            {intervention.parlementaire_nom}
            {intervention.intervention_fonction &&
              `, ${intervention.intervention_fonction}`}
          </MyLink>
          <div>
            {currentSectionId && (
              <>
                <MyLink href={`#table_${currentSectionId}`}>
                  Début de section
                </MyLink>
                -
              </>
            )}
            <MyLink href={`#inter_${intervention.intervention_md5}`}>
              Permalien
            </MyLink>
          </div>
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: intervention.intervention_intervention,
          }}
        ></div>
      </div>
    </div>
  )
}

export function InterventionPersonnaliteComp({
  intervention,
  currentSectionId,
}: {
  intervention: InterventionPersonnalite
  currentSectionId: number | null
}) {
  return (
    <div
      id={`inter_${intervention.intervention_md5}`}
      className="flex rounded-lg bg-slate-200 p-2 shadow-lg"
    >
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
          title={intervention.personnalite_nom}
          width={55}
          height={70}
        />
      </MyLink>
      <div className="w-full">
        <div className="flex justify-between">
          <span>{intervention.personnalite_nom}</span>
          <div>
            {currentSectionId && (
              <>
                <MyLink href={`#table_${currentSectionId}`}>
                  Début de section
                </MyLink>
                -
              </>
            )}
            <MyLink href={`#inter_${intervention.intervention_md5}`}>
              Permalien
            </MyLink>
          </div>
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: intervention.intervention_intervention,
          }}
        ></div>
      </div>
    </div>
  )
}

export function SectionTitle({
  intervention,
  depth,
}: {
  intervention: InterventionWithSectionTitre
  depth: 1 | 2
}) {
  return (
    <div
      id={`table_${intervention.intervention_section_id}`}
      className="flex justify-between"
    >
      <div></div> {/* empty element for flex balance */}
      {depth === 1 && (
        <h2 className="text-center text-xl">
          {capitalizeFirst(intervention.section_titre)}
        </h2>
      )}
      {depth === 2 && (
        <h3 className="text-center text-lg">
          {capitalizeFirst(intervention.section_titre)}
        </h3>
      )}
      <div>
        <MyLink href={`#sommaire`}>Retour au sommaire</MyLink>-
        <MyLink href={`#table_${intervention.intervention_section_id}`}>
          Permalien
        </MyLink>
      </div>
    </div>
  )
}

export function Didascalie({ intervention }: { intervention: Intervention }) {
  return (
    <div id={`inter_${intervention.intervention_md5}`} className="ml-16 italic">
      <div
        dangerouslySetInnerHTML={{
          __html: intervention.intervention_intervention,
        }}
      />
    </div>
  )
}
