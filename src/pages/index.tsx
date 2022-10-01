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
      <BasicLink to="/page-with-long-content" />
      <BasicLink to="/deputes" />
      <BasicLink to="/damien-abad" />
    </div>
  )
}

export default Home
