import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="m-4 rounded-xl bg-slate-200 text-center">
        <h1 className="m-4 text-2xl font-extrabold">À propos</h1>
        <p className="m-4">
          Site d'information et de vulgarisation sur le fonctionnement de
          l'Assemblée Nationale.
        </p>
        <p className="m-4">En construction.</p>
      </div>
    </div>
  )
}

export default Home
