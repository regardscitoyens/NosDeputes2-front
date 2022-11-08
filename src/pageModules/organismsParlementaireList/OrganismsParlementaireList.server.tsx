import { GetServerSideProps } from 'next'
import { queryOrganismsList } from '../../lib/queryOrganismsList'
import * as types from './OrganismsParlementaireList.types'

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const organismes = await queryOrganismsList('parlementaire')
  return {
    props: {
      data: { organismes },
    },
  }
}
