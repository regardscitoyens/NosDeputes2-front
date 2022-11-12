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
import { groupBy, mapValues } from 'lodash'

function libelleSeance(seance: types.Props['seance']): string {
  return seance.type === 'commission' ? 'réunion' : 'séance'
}

export function Page({ seance, seanceSummary, interventions }: types.Props) {
  // TODO gestion de l'organisme
  return (
    <div>
      <h1 className="text-center text-2xl">
        Séance en hémicycle du {formatDate(seance.date)} à {seance.moment}
      </h1>
      <h2 className="text-xl">Résumé de la {libelleSeance(seance)}</h2>
      <Todo>Graphe de répartition des temps de parole</Todo>
      <Todo>Mots clefs de la {libelleSeance(seance)}</Todo>
      <h3 className="text-xl">Sommaire</h3>
      <SeanceSummary seanceSummary={seanceSummary} />
      <h2 className="text-xl">La {libelleSeance(seance)}</h2>
      {interventions.length > 0 ? (
        <MyLink targetBlank href={interventions[0].intervention_source}>
          Source
        </MyLink>
      ) : (
        <></>
      )}
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
  const interventionsIdsForSections: { [sectionId: string]: number } =
    mapValues(
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
        interventionsIdsForSections[
          intervention.intervention_section_id.toString()
        ]
    )
  }

  function InterventionComp({ intervention }: { intervention: Intervention }) {
    if (isInterventionParlementaire(intervention)) {
      return <InterventionParlementaireComp intervention={intervention} />
    } else if (isInterventionPersonnalite(intervention)) {
      return <InterventionPersonnaliteComp intervention={intervention} />
    } else if (
      hasSectionTitre(intervention) &&
      isSectionIntervention(intervention)
    ) {
      return (
        <InterventionSectionComp
          intervention={intervention}
          depth={sectionDepth(intervention.intervention_section_id)}
        />
      )
    } else {
      return <Didascalie intervention={intervention} />
    }
  }

  return (
    <div>
      {interventions.map(intervention => (
        <InterventionComp
          key={intervention.intervention_md5}
          intervention={intervention}
        />
      ))}
    </div>
  )
}

export function InterventionParlementaireComp({
  intervention,
}: {
  intervention: InterventionParlementaire
}) {
  return (
    <div
      id={'inter_' + intervention.intervention_md5}
      style={{ display: 'flex' }}
    >
      <MyLink
        href={intervention.parlementaire_slug}
        style={{ flex: 'none', marginRight: '15px' }}
      >
        <Image
          src={`/deputes/photos/${CURRENT_LEGISLATURE}/${intervention.parlementaire_id_an}.jpg`}
          alt={`Photo de  ${intervention.parlementaire_nom}`}
          title={intervention.parlementaire_nom}
          width={55}
          height={70}
        />
      </MyLink>
      <div>
        <MyLink href={intervention.parlementaire_slug}>
          {intervention.parlementaire_nom}
          {intervention.intervention_fonction &&
            `, ${intervention.intervention_fonction}`}
        </MyLink>
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
}: {
  intervention: InterventionPersonnalite
}) {
  return (
    <div id={'inter_' + intervention.intervention_md5}>
      <h4 className="text-lg">{intervention.personnalite_nom}</h4>
      <div
        dangerouslySetInnerHTML={{
          __html: intervention.intervention_intervention,
        }}
      ></div>
    </div>
  )
}

export function InterventionSectionComp({
  intervention,
  depth,
}: {
  intervention: InterventionWithSectionTitre
  depth: 1 | 2
}) {
  return (
    <div id={'inter_' + intervention.intervention_md5}>
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
    </div>
  )
}

export function Didascalie({ intervention }: { intervention: Intervention }) {
  return (
    <div
      id={'inter_' + intervention.intervention_md5}
      style={{ fontStyle: 'oblique', marginLeft: '15px' }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: intervention.intervention_intervention,
        }}
      />
    </div>
  )
}
