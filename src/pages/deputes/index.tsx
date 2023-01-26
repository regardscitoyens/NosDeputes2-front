import { GetStaticPaths, InferGetServerSidePropsType } from 'next'
import * as render from '../../pageModules/deputeList/DeputeList.render'
import * as server from '../../pageModules/deputeList/DeputeList.server'

// export const getStaticPaths: GetStaticPaths = () => {
//   return {
//     paths: [{ params: { id: '1' } }, { params: { id: '2' } }],



//     fallback: false, // can also be true or 'blocking'
//   }
// }

export const getServerSideProps = server.getServerSideProps

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <render.Page {...data} />
}
