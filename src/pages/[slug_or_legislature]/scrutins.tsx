import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { Todo } from '../../components/Todo'
import { db } from '../../repositories/db'
import partition from 'lodash/partition'
import groupBy from 'lodash/groupBy'

type Data = {
  scrutinsOnWhole: LocalScrutin[]
  othersScrutinsByLaw: { [law: string]: LocalScrutin[] }
}

type LocalScrutin = {
  id: number
  titre: string
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const scrutins = await db
    .selectFrom('scrutin')
    .orderBy('numero', 'desc')
    .select('id')
    .select('titre')
    .execute()

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

function getLaw(scrutin: LocalScrutin): string {
  const { titre } = scrutin
  // TODO faire marcher cette regexp (venue du PHP)
  const regexp = /((?:projet|proposition) de (?:loi|résolution) .*?(?:\)|$))/
  return 'TODO'
  /*

   preg_match_all('/((?:projet|proposition) de (?:loi|résolution) .*?(?:\)|$))/', $this->titre, $matches, PREG_SET_ORDER, 0);
    if ($matches) {
      return $matches[0][0];
    }

    */
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

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <Todo>Les scrutins publics</Todo>
}
