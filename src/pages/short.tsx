import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div className="flex h-full items-center justify-center bg-slate-200">
      <div className="text-center">
        <p className="font-bold text-red-600">
          page with very little content, to test the layout
        </p>
        <p className="font-bold text-red-600">
          The content should be centered vertically within the page
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
          lectus libero, maximus quis quam in, bibendum varius massa. In tempor
          tortor non dignissim dignissim. Sed pretium varius odio, non malesuada
          lectus egestas sed. Nullam fermentum, neque id semper vehicula, leo
          nibh l
        </p>
      </div>
    </div>
  )
}

export default Home
