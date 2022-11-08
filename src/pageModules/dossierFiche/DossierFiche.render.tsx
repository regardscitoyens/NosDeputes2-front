import { Todo } from '../../components/Todo'

import { ReactNode } from 'react'
import { MyLink } from '../../components/MyLink'
import { CURRENT_LEGISLATURE } from '../../lib/hardcodedData'
import * as types from './DossierFiche.types'
import { formatDate } from '../../lib/utils'

function BasicBlock({
  title,
  children,
}: {
  children?: ReactNode
  title: string
}) {
  return (
    <div className="my-4 bg-slate-200 px-8">
      <h2 className="text-xl  font-semibold ">{title}</h2>
      {children}
    </div>
  )
}
export function Page({
  section,
  seances,
  textesLoi,
  othersLoiWithoutTexte,
  subSections,
  speakingDeputes,
}: types.Props) {
  return (
    <div>
      <h1 className="text-center text-2xl">{section.titre_complet}</h1>
      <div className="flex flex-row">
        <div className="w-1/2 px-4">
          <BasicBlock title="Documents législatifs">
            <ul className="list-disc">
              {textesLoi.map(({ id, titre, numero, type, type_details }) => {
                return (
                  <li key={id}>
                    <span className="mr-2 text-slate-500 ">n°{numero}</span>
                    <MyLink href={`/${CURRENT_LEGISLATURE}/document/${id}`}>
                      {type} {type_details} {titre}
                    </MyLink>
                  </li>
                )
              })}
              {othersLoiWithoutTexte.map(numero => {
                return (
                  <li key={numero}>
                    <span className="mr-2 text-slate-500 ">n°{numero}</span>
                  </li>
                )
              })}
            </ul>
          </BasicBlock>
          <BasicBlock title="Les débats consacrés à ce dossier">
            <ul className="list-disc">
              {seances.map(seance => {
                return (
                  <li key={seance.id}>
                    <MyLink
                      href={`/${CURRENT_LEGISLATURE}/seance/${seance.id}#table_${section.id}`}
                    >
                      Séance en {seance.type} du {formatDate(seance.date)} à{' '}
                      {seance.moment}
                    </MyLink>
                  </li>
                )
              })}
            </ul>
          </BasicBlock>
          <BasicBlock title="Les principaux orateurs sur ce dossier">
            <ul className="list-disc">
              {speakingDeputes.map(depute => {
                return (
                  <li key={depute.id}>
                    <MyLink
                      href={`/${CURRENT_LEGISLATURE}/${depute.slug}/dossier/${section.id}`}
                    >
                      {depute.nom}
                    </MyLink>
                  </li>
                )
              })}
            </ul>
          </BasicBlock>
        </div>
        <div className="w-1/2 px-4">
          <Todo>le nuage de mots</Todo>
          <BasicBlock title="Organisation du dossier">
            <ul className="list-disc">
              {subSections.map(({ id, titre, seance_id }) => {
                return (
                  <li key={id}>
                    <MyLink
                      href={`/${CURRENT_LEGISLATURE}/seance/${seance_id}#table_${id}`}
                    >
                      {titre}
                    </MyLink>
                  </li>
                )
              })}
            </ul>
          </BasicBlock>
        </div>
      </div>
    </div>
  )
}
