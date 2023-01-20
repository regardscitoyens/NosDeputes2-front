import range from 'lodash/range'
import { GetServerSideProps } from 'next'
import { dbReleve } from '../../lib/dbReleve'
import {
  FIRST_LEGISLATURE_FOR_DEPUTES,
  LATEST_LEGISLATURE,
} from '../../lib/hardcodedData'
import * as types from './MandatsParCirco.types'
import sortBy from 'lodash/sortBy'

// two ways to access this page :
// /deputes
// /deputes/15
type Query = {
  legislature?: string
}

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const query = context.query as Query
  const legislatureInPath = query.legislature
    ? parseInt(query.legislature, 10)
    : null
  if (legislatureInPath === LATEST_LEGISLATURE) {
    return {
      redirect: {
        permanent: false,
        destination: `/mandats-par-circonscription`,
      },
    }
  }
  const legislature = legislatureInPath ?? LATEST_LEGISLATURE
  const legislatureNavigationUrls = range(
    FIRST_LEGISLATURE_FOR_DEPUTES,
    LATEST_LEGISLATURE + 1,
  ).map(l => {
    const tuple: [number, string] = [
      l,
      `/mandats-par-circonscription${l !== LATEST_LEGISLATURE ? `/${l}` : ''}`,
    ]
    return tuple
  })

  const rows = (
    await dbReleve
      .selectFrom('derived_deputes_mandats')
      .where('legislature', '=', legislature)
      .where('nb_mandats', '>', 1)
      .select('data')
      .execute()
  ).map(_ => _.data as types.DerivedDeputesMandats)

  const rowsSorted = sortBy(
    rows,
    _ =>
      `${_.circo.region_type} - ${_.circo.region} - ${_.circo.num_dpt} - ${_.circo.num_circo}`,
  )

  return {
    props: {
      data: {
        legislature,
        legislatureNavigationUrls,
        dataByCirco: rowsSorted,
      },
    },
  }
}
