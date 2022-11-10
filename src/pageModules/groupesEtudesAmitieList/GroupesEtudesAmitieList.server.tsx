import { GetServerSideProps } from 'next'
import { queryOrganismsList } from '../../lib/queryOrganismsList'
import * as types from './GroupesEtudesAmitieList.types'

export const getServerSideProps: GetServerSideProps<{
  data: types.Props
}> = async context => {
  const organismes = await queryOrganismsList('groupes')
  return {
    props: {
      data: { organismes },
    },
  }
}
