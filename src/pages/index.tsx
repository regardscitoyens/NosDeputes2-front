import type { NextPage } from 'next'
import Link from 'next/link'

function BasicLink({ to }: { to: string }) {
  return (
    <Link href={to}>
      <a className="block text-blue-500">{to}</a>
    </Link>
  )
}

const Home: NextPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <h1>Nos deputes homepage</h1>

      <BasicLink to="/big" />
      <BasicLink to="/deputes" />
      <BasicLink to="/damien-abad" />
    </div>
  )
}

export default Home
