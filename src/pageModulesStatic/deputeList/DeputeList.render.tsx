import sortBy from 'lodash/sortBy'
import uniq from 'lodash/uniq'
import { BigTitle } from '../../components/BigTitle'
import { DeputeItem } from '../../components/DeputeItem'
import { LegislatureNavigation } from '../../components/LegislatureNavigation'
import { partitionDeputesByGroup } from '../../lib/utils'
import * as types from './DeputeList.types'

export function ChunkOfDeputes({
  title,
  explanation,
  deputes,
  legislature,
}: {
  title?: string
  explanation?: string
  deputes: types.Depute[]
  legislature: number
}) {
  if (deputes.length === 0) return null

  const allInSameGroupe =
    uniq(deputes.map(_ => _.latestGroup?.acronym)).length === 1
  const deputesSorted = allInSameGroupe
    ? sortBy(deputes, _ => {
        const fonction = _.latestGroup?.fonction
        const score =
          fonction === 'Président' ? 100 : fonction === 'Membre' ? 50 : 10
        return -score
      })
    : deputes

  return (
    <>
      {title && explanation && (
        <SmallTitle label={title} secondLabel={explanation} />
      )}
      <div className="my-4 flex flex-wrap gap-2">
        {deputesSorted.map(depute => {
          return (
            <DeputeItem
              key={depute.uid}
              {...{ depute, legislature }}
              displayCirco
              className="grow"
            />
          )
        })}
      </div>
    </>
  )
}

export function DeputesByGroup({
  deputes,
  legislature,
}: {
  deputes: types.Depute[]
  legislature: number
}) {
  if (deputes.length === 0) return null
  const deputesByGroup = partitionDeputesByGroup(deputes)

  return (
    <>
      {deputesByGroup.map(deputesOfOneGroupe => {
        const acronym = deputesOfOneGroupe[0].latestGroup?.acronym ?? ''
        return (
          <ChunkOfDeputes
            key={acronym}
            deputes={deputesOfOneGroupe}
            {...{ legislature }}
          />
        )
      })}
    </>
  )
}

function AllDeputesOfMajoriteOrOpposition({
  deputes,
  kind,
  legislature,
}: {
  deputes: types.Depute[]
  kind: 'majorite' | 'opposition'
  legislature: number
}) {
  return (
    <>
      <BigTitle
        label={
          kind === 'majorite'
            ? `Députés de la majorité`
            : "Députés de l'opposition"
        }
        secondLabel={`${deputes.length} députés`}
        heading={
          kind === 'majorite'
            ? "C'est le groupe majoritaire (en nombre de députés), et ses groupes alliés (ils ne se sont pas déclarés dans l'opposition)."
            : `Leurs groupes se sont déclarés comme faisant partie de l'opposition.`
        }
      />
      <DeputesByGroup deputes={deputes} {...{ legislature }} />
    </>
  )
}

function SmallTitle({
  label,
  secondLabel,
}: {
  label: string
  secondLabel: string
}) {
  return (
    <>
      <h2 className="text-center text-2xl font-bold">{label}</h2>
      <p className="text-center text-slate-600">{secondLabel}</p>
    </>
  )
}

function DeputesLeftOver({
  deputesCurrent,
  deputesFormer,
  legislature,
}: {
  deputesCurrent: types.Depute[]
  deputesFormer: types.Depute[]
  legislature: number
}) {
  return (
    <>
      <ChunkOfDeputes
        title={`Députés "non-inscrits"`}
        explanation={`Ils ne peuvent pas ou ne souhaitent pas rejoindre un autre groupe, ou en ont été exclus.`}
        deputes={deputesCurrent.filter(_ => _.latestGroup?.acronym === 'NI')}
        {...{ legislature }}
      />
      <ChunkOfDeputes
        title="Anciens députés sans groupe"
        explanation={`Ils n'ont jamais été rattachés à un groupe, même pas le groupe des «Non-inscrits». En général c'est qu'ils ont été techniquement députés pendant très peu de temps (quelques heures)`}
        deputes={deputesFormer.filter(_ => _.latestGroup === null)}
        {...{ legislature }}
      />
      <ChunkOfDeputes
        title="Anciens députés de cette législature"
        explanation={`Ils sont devenus ministres, ou ont démissionné, etc.`}
        deputes={deputesFormer}
        {...{ legislature }}
      />
    </>
  )
}

function DeputeListIfPositionPolitiqueAvailable({
  deputesCurrent,
  deputesFormer,
  legislature,
}: {
  deputesCurrent: types.Depute[]
  deputesFormer: types.Depute[]
  legislature: number
}) {
  const deputesMajoritaire = deputesCurrent.filter(
    _ => _.latestGroup?.position_politique === 'Majoritaire',
  )
  const deputesMinoritaire = deputesCurrent.filter(
    _ => _.latestGroup?.position_politique === 'Minoritaire',
  )
  const deputesOpposition = deputesCurrent.filter(
    _ => _.latestGroup?.position_politique === 'Opposition',
  )

  return (
    <>
      <AllDeputesOfMajoriteOrOpposition
        deputes={[...deputesMajoritaire, ...deputesMinoritaire]}
        kind="majorite"
        {...{ legislature }}
      />
      <AllDeputesOfMajoriteOrOpposition
        deputes={deputesOpposition}
        kind="opposition"
        {...{ legislature }}
      />
      <DeputesLeftOver {...{ deputesCurrent, deputesFormer, legislature }} />
    </>
  )
}

function DeputeListIfPositionPolitiqueNotAvailable({
  deputesCurrent,
  deputesFormer,
  legislature,
}: {
  deputesCurrent: types.Depute[]
  deputesFormer: types.Depute[]
  legislature: number
}) {
  const deputesCurrentWithGroup = deputesCurrent.filter(
    _ => _.latestGroup !== null && _.latestGroup.acronym !== 'NI',
  )
  return (
    <>
      <SmallTitle
        label="Députés par groupe"
        secondLabel="Dans cette législature, les groupes ne déclaraient pas encore un statut
        officiel de «majorité» ou d'«opposition»."
      />

      <DeputesByGroup deputes={deputesCurrentWithGroup} {...{ legislature }} />
      <DeputesLeftOver {...{ deputesCurrent, deputesFormer, legislature }} />
    </>
  )
}

export function Page({
  deputes,
  legislature,
  legislatureNavigationUrls,
}: types.Props) {
  // Sur des vieilles législature, on n'a pas la notion de position politique
  const positionPolitiquesAreAvailable = deputes.every(_ => {
    return (
      _.latestGroup?.position_politique !== null ||
      _.latestGroup.acronym === 'NI'
    )
  })

  const deputesCurrent = deputes.filter(_ => _.mandat_ongoing)
  const deputesFormer = deputes.filter(_ => !_.mandat_ongoing)

  return (
    <div>
      <LegislatureNavigation
        title="Tous les députés"
        currentLegislature={legislature}
        urlsByLegislature={legislatureNavigationUrls}
      />

      {/* <GrapheRepartitionGroupes {...{ groupesData }} /> */}

      {positionPolitiquesAreAvailable ? (
        <DeputeListIfPositionPolitiqueAvailable
          {...{ deputesCurrent, deputesFormer, legislature }}
        />
      ) : (
        <DeputeListIfPositionPolitiqueNotAvailable
          {...{ deputesCurrent, deputesFormer, legislature }}
        />
      )}
    </div>
  )
}
