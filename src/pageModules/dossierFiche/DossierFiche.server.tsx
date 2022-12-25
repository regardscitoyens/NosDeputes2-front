import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import { Dossier } from '../../lib/dossier'
import * as types from './DossierFiche.types'

type Query = {
  id: string
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const query = context.query as Query
  const id = query.id

  const dossier = await dbReleve
    .selectFrom('dossiers')
    .where('uid', '=', id)
    .select('data')
    .executeTakeFirst()

  if (!dossier) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      data: {
        dossier: dossier.data as Dossier,
      },
    },
  }
}
