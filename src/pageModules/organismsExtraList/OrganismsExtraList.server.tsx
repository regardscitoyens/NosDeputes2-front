import { GetServerSideProps } from 'next'
import { queryOrganismsList } from '../../lib/queryOrganismsList'
import * as types from './OrganismsExtraList.types'

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const organismes = await queryOrganismsList('extra')
  return {
    props: {
      data: { organismes },
    },
  }
}
