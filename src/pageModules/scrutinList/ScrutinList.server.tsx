import groupBy from 'lodash/groupBy'
import partition from 'lodash/partition'
import { GetServerSideProps } from 'next'
import { dbLegacy } from '../../lib/dbLegacy'
import * as types from './ScrutinList.types'

function getLaw(scrutin: types.Scrutin): string | null {
  const { titre } = scrutin
  const regexp = /((?:projet|proposition) de (?:loi|résolution) .*?(?:\)|$))/
  const match = titre.match(regexp)
  if (match) {
    return match[0]
  }
  return null
}

function isOnWholeText(scrutin: types.Scrutin) {
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

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const scrutins = (
    await dbLegacy
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
