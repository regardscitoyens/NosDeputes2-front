import groupBy from 'lodash/groupBy'
import partition from 'lodash/partition'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Link from 'next/link'
import { MyLink } from '../../components/MyLink'
import { Todo } from '../../components/Todo'
import { db } from '../../repositories/db'
import { CURRENT_LEGISLATURE } from '../../services/hardcodedData'
import { formatDate } from '../../services/utils'

type Data = {
  scrutinsOnWhole: LocalScrutin[]
  othersScrutinsByLaw: { [law: string]: LocalScrutin[] }
}

type LocalScrutin = {
  id: number
  titre: string
  date: string
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const scrutins = (
    await db
      .selectFrom('scrutin')
      .orderBy('numero', 'desc')
      .select('id')
      .select('titre')
      .select('date')
      .execute()
  ).map(_ => ({
    ..._,
    date: _.date.toISOString(),
  }))

  const [scrutinsOnWhole, otherScrutins] = partition(scrutins, isOnWholeText)

  const othersScrutinsByLaw = groupBy(otherScrutins, getLaw)

  return {
    props: {
      data: {
        scrutinsOnWhole,
        othersScrutinsByLaw,
      },
    },
  }
}

function getLaw(scrutin: LocalScrutin): string | null {
  const { titre } = scrutin
  const regexp = /((?:projet|proposition) de (?:loi|résolution) .*?(?:\)|$))/
  const match = titre.match(regexp)
  if (match) {
    return match[0]
  }
  return null
}

function isOnWholeText(scrutin: LocalScrutin) {
  function startsWith(...possibleStarts: string[]) {
    return possibleStarts.some(s => scrutin.titre.startsWith(s))
  }
  if (
    startsWith(
      "l'ensemble",
      `la déclaration `,
      `la déclaration`,
      `la motion de censure`,
      `la proposition de résolution`,
      `les conclusions de rejet`,
    )
  ) {
    return true
  }
  if (
    startsWith(
      `l'amendement`,
      `les crédits`,
      `la motion de rejet préalable`,
      `l'article`,
      `la première partie`,
      `le sous-amendement`,
      `le sous-amendment`,
      `l'opposition à la demande de constitution`,
      `la demande de suspension de séance`,
      `le demande de suspension de séance`,
      'la motion référendaire',
      `la motion d'ajournement`,
      `la motion de renvoi en commission`,
      `la motion de renvoi en commision`,
      `la demande de constitution de commission spéciale`,
    )
  ) {
    return false
  }
}

function ScrutinList({
  scrutins,
  law,
}: {
  scrutins: LocalScrutin[]
  law?: string
}) {
  return (
    <ul className={`${law ? 'ml-16' : ''} list-disc`}>
      {scrutins.map(scrutin => {
        const { titre, id, date } = scrutin
        const finalTitre = law ? titre.replace(law, '...') : titre
        return (
          <li key={id} className="odd:bg-slate-200 ">
            <MyLink href={`/${CURRENT_LEGISLATURE}/scrutin/${id}`}>
              {formatDate(date)} : {finalTitre}
            </MyLink>
          </li>
        )
      })}
    </ul>
  )
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { scrutinsOnWhole, othersScrutinsByLaw } = data
  return (
    <>
      <Todo>lien vers chacun des scrutins</Todo>
      <div className="flex flex-row">
        <div className="w-1/2 px-8">
          <h1 className="my-4 text-2xl">Les scrutins sur l'ensemble</h1>
          <ScrutinList scrutins={scrutinsOnWhole} />
        </div>
        <div className="w-1/2 ">
          <h1 className="my-4 text-2xl">Autres scrutins</h1>
          <ul>
            {Object.entries(othersScrutinsByLaw).map(([law, scrutins]) => (
              <li key={law}>
                {law} :
                <ScrutinList {...{ scrutins, law }} />{' '}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
