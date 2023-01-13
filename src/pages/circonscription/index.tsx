import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

import { MapFrance } from '../../components/MapFrance'

export default function Page() {
  return (
    <>
      <div className="mx-auto my-4 w-[52rem] rounded-xl bg-slate-200 p-5">
        <h1 className="text-center text-4xl font-extrabold">
          Toutes les circonscriptions par département
        </h1>
      </div>

      <div className="mt-20">
        <MapFrance
          onHover={() => {}}
          onMouseOut={() => {}}
          onClick={() => {}}
        />
      </div>
    </>
  )
}
