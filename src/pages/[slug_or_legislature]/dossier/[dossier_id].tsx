import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import PHPUnserialize from 'php-unserialize'
import { ReactNode } from 'react'
import { MyLink } from '../../../components/MyLink'
import { Todo } from '../../../components/Todo'
import { db } from '../../../repositories/db'
import { CURRENT_LEGISLATURE } from '../../../services/hardcodedData'
import { notNull, parseIntOrNull } from '../../../services/utils'

type Data = {
  section: LocalSection
  subSections: LocalSubSectionWithSeance[]
  seances: LocalSeance[]
  textesLoi: LocalTexteLoi[]
}

type LocalSection = {
  id: number
  section_id: number
  titre_complet: string
  id_dossier_an: string | null
}
type LocalSubSection = {
  id: number
  titre: string | null
  titre_complet: string
}
type LocalSubSectionWithSeance = LocalSubSection & {
  seance_id: number | null
}
type LocalSeance = {
  id: number
  date: Date
  moment: string
  type: 'hemicycle' | 'commission'
}
type LocalTexteLoi = {
  id: string
  numero: number
  type:
    | `Proposition de loi`
    | `Projet de loi`
    | `Proposition de résolution`
    | `Rapport`
    | `Rapport d'information`
    | `Avis`
  type_details: string | null
  titre: string
  signataires: string
}

// why all this ??
// linkDossiers is something like this
// (when transformed to js)
// {
//   '58' : '56',
//   '152' : '17',
//   '188' : '184',
//   '56' : '296',
//   '454' : '461',
//   '427' : '496',
// }
// Example https://www.nosdeputes.fr/16/dossier/152
// is transformed into https://www.nosdeputes.fr/16/dossier/17
// TODO understand why
// TODO do it as redirect, it's probably better for SEO etc.
async function getFinalSectionId(givenSectionId: number): Promise<number> {
  const linkdossiersRaw = (
    await db
      .selectFrom('variable_globale')
      .where('champ', '=', 'linkdossiers')
      .select('value')
      .executeTakeFirst()
  )?.value?.toString('utf-8')
  const linkDossiers = linkdossiersRaw
    ? (PHPUnserialize.unserialize(linkdossiersRaw) as { [k: string]: string })
    : null

  if (linkDossiers) {
    const link = linkDossiers[givenSectionId.toString()]
    if (link) {
      try {
        return parseInt(link, 10)
      } catch (e) {
        throw new Error(
          `Cannot parse something from linkdossiers as int: "${link}"`,
        )
      }
    }
  }
  return givenSectionId
}

async function getSubSections(
  givenSectionId: number,
): Promise<LocalSubSection[]> {
  return await db
    .selectFrom('section')
    .where('section_id', '=', givenSectionId)
    .orderBy('min_date')
    .orderBy('timestamp')
    .select(['id', 'titre', 'titre_complet'])
    .execute()
}

async function getFirstSeance(
  subSection: LocalSubSection,
): Promise<number | null> {
  // TODO pas du tout efficace puisqu'on le refait pour chaque sous section. C'était comme ça dans le PHP. A voir si on pourrait le faire en une seule query
  return (
    (
      await db
        .selectFrom('seance')
        .innerJoin('intervention', 'seance.id', 'intervention.seance_id')
        .innerJoin('section', 'section.id', 'intervention.section_id')
        .where('section.section_id', '=', subSection.id)
        .orWhere('section.id', '=', subSection.id)
        .groupBy('seance.id')
        // ces order by sont erronés (c'était dans le PHP) je crois car ils sont effectués après le GROUP BY
        // ça ne devrait pas affecter les résultat si une section n'est toujours présente que dans une séance, est-ce le cas ? peut-être pas car sinon il y aurait directement une FK de section vers séance...
        .orderBy('section.min_date')
        .orderBy('section.timestamp')
        .limit(1)
        .select('seance.id')
        .executeTakeFirst()
    )?.id ?? null
  )
}

function filterSeancesRowNotNull(
  seances: (
    | LocalSeance
    | {
        id: number | null
        date: Date | null
        moment: string | null
        type: 'hemicycle' | 'commission' | null
      }
  )[],
): LocalSeance[] {
  return seances.reduce<LocalSeance[]>((acc, seance) => {
    const { id, date, moment, type } = seance
    if (id !== null && date !== null && moment !== null && type !== null) {
      return [...acc, { id, date, moment, type }]
    }
    return acc
  }, [])
}

async function getTexteLois(
  section: { id_dossier_an: string | null },
  texteLoisNumeros: number[],
): Promise<LocalTexteLoi[]> {
  if (section.id_dossier_an || texteLoisNumeros.length > 0) {
    return await db
      .selectFrom('texteloi')
      .where(qb =>
        qb
          .where('annexe', 'is', null)
          .where('texteloi.numero', 'in', texteLoisNumeros),
      )
      .if(section.id_dossier_an !== null, qb =>
        qb.orWhere(qb =>
          qb
            .where('annexe', 'is', null)
            .where(
              'texteloi.id_dossier_an',
              '=',
              section.id_dossier_an as string,
            ),
        ),
      )
      .orderBy('numero')
      .select(['id', 'numero', 'type', 'type_details', 'titre', 'signataires'])
      .execute()
  }
  return []
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const idStr = context.query.dossier_id as string
  const id = parseIntOrNull(idStr)
  if (!id) {
    return {
      notFound: true,
    }
  }
  const finalSectionId = await getFinalSectionId(id)
  const section = await db
    .selectFrom('section')
    .where('id', '=', finalSectionId)
    .select(['titre_complet', 'id_dossier_an', 'id', 'section_id'])
    .executeTakeFirst()

  const seances: LocalSeance[] = filterSeancesRowNotNull(
    // TODO cette query ne marche pas, il y a pas de full join en mysql ? voir comment faire
    // au pire, splitter en deux queries
    true
      ? []
      : await db
          .selectFrom('seance')
          .fullJoin('intervention', 'intervention.seance_id', 'seance.id')
          .fullJoin('section', 'section.id', 'intervention.section_id')
          // sections qui sont filles de la section donnée
          .where('section.section_id', '=', finalSectionId)
          // interventions qui ciblent la section donnée
          .orWhere('intervention.section_id', '=', finalSectionId)
          .groupBy('seance.id')
          .select(['seance.id', 'seance.date', 'seance.type', 'seance.moment'])
          .execute(),
  )

  if (seances.length === 1 && seances[0].type === 'commission') {
    // TODO redirect vers /16/seance/SEANCE_ID#table_SECTION_ID ???
    // pas trouvé d'exemple pour tester ....
    // pas sûr de si c'est utile...
  }

  if (!section) {
    return {
      notFound: true,
    }
  }

  // TODO continue by copying queries from executeShow() in apps/frontend/modules/section/actions/actions.class.php

  const texteLoisNumeros: number[] = (
    await db
      .selectFrom('tagging')
      .innerJoin('tag', 'tag.id', 'tagging.tag_id')
      .where('tagging.taggable_model', '=', 'Section')
      .where('tagging.taggable_id', '=', finalSectionId)
      .where('is_triple', '=', 1)
      .where('triple_namespace', '=', 'loi')
      .where('triple_key', '=', 'numero')
      .select('triple_value')
      .execute()
  )
    .map(_ => _.triple_value)
    .filter(notNull)
    .map(parseIntOrNull)
    .filter(notNull)

  const textesLoi = await getTexteLois(section, texteLoisNumeros)

  // Il y avait aussi un truc avec "titre_loi"  dans le code,
  // mais la table est vide sur au moins deux législatures, donc je n'ai pas repris

  const isParentSection = section.id === section.section_id
  // TODO check that : on fait un leftjoin, du coup on récupère TOUTES les interventions qui ont au moins 20 mots non ?
  const interventionsIds = (
    await db
      .selectFrom('intervention')
      .leftJoin('section', 'section.id', 'intervention.seance_id')
      // si c'est une section mère, on s'intéressent à ses sections filles
      .if(isParentSection, db =>
        db.where('section.section_id', '=', section.id),
      )
      .if(!isParentSection, db => db.where('section.id', '=', section.id))
      .where('intervention.nb_mots', '>', 20)
      .select('intervention.id')
      .execute()
  ).map(_ => _.id)

  // TODO ensuite il y a avait une query qui démarre comme ça sur les tags, pour afficher le nuage de mots
  // mais dans le php c'est dans un component partagé, ce sera un peu compliqué
  //
  // await db
  //   .selectFrom('tag')
  //   .innerJoin('tagging', 'tagging.tag_id', 'tag.id')
  //   .where('taggable_id', 'in', interventionsIds)
  //   .where('taggable_model', '=', 'Intervention')

  const subSections = await getSubSections(finalSectionId)

  const finalSubSections = await Promise.all(
    subSections.map(async _ => {
      const seance_id = await getFirstSeance(_)
      return {
        ..._,
        seance_id,
      }
    }),
  )

  return {
    props: {
      data: {
        section,
        seances,
        textesLoi,
        subSections: finalSubSections,
      },
    },
  }
}

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

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { section, seances, textesLoi, subSections } = data
  return (
    <div>
      <h1 className="text-2xl">{section.titre_complet}</h1>

      <Todo>Tout le dossier...</Todo>
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
        </ul>
      </BasicBlock>
      <BasicBlock title="Les débats consacrés à ce dossier">
        <ul className="list-disc">
          {seances.map(seance => {
            return <li key={seance.id}>{seance.date.toISOString()}</li>
          })}
        </ul>
      </BasicBlock>
      <BasicBlock title="Les principaux orateurs sur ce dossier"></BasicBlock>
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
  )
}
