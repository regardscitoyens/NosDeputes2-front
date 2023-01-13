import Link from 'next/link'
import { useState } from 'react'
import { MapFrance } from '../../components/MapFrance'
import { departements } from '../../lib/hardcodedData'

type DepartementEntry = [string, string]

function DepartementList({
  departements,
  selected,
  onHover,
  onMouseOut,
}: {
  departements: DepartementEntry[]
  selected?: string
  onHover: Function
  onMouseOut: Function
}) {
  return (
    <>
      {departements.map(([nom, id]: [nom: string, id: string]) => (
        <li
          key={id}
          style={{
            background: selected === id ? '#deecbd' : 'inherit',
            listStyleType: 'none',
            textDecoration: 'underline',
          }}
          onMouseOver={() => onHover(id)}
          onMouseOut={() => onMouseOut(id)}
        >
          <Link
            href={`/circonscription/departement/${encodeURIComponent(nom)}`}
          >
            {id}-{nom}
          </Link>
        </li>
      ))}
    </>
  )
}

export default function Page() {
  const [departement, setDepartement] = useState<string | undefined>()
  const departementsEntries = Object.entries(departements)
  const onHover = (id: string) => {
    setDepartement(id)
  }
  const onMouseOut = () => {
    setDepartement(undefined)
  }
  const onClick = () => {
    console.log('click')
  }
  return (
    <>
      <div className="mx-auto my-4 w-[52rem] rounded-xl bg-slate-200 p-5">
        <h1 className="text-center text-4xl font-extrabold">
          Toutes les circonscriptions par département
        </h1>
      </div>

      <div className="mt-20">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <MapFrance
              onHover={onHover}
              onMouseOut={onMouseOut}
              onClick={onClick}
              selected={departement}
            />
          </div>
          <div className="col-span-2">
            <DepartementList
              selected={departement}
              departements={departementsEntries.slice(0, 37)}
              onHover={onHover}
              onMouseOut={onMouseOut}
            />
          </div>
          <div className="col-span-2">
            <DepartementList
              selected={departement}
              departements={departementsEntries.slice(37, 74)}
              onHover={onHover}
              onMouseOut={onMouseOut}
            />
          </div>
          <div className="col-span-2">
            <DepartementList
              selected={departement}
              departements={departementsEntries.slice(74)}
              onHover={onHover}
              onMouseOut={onMouseOut}
            />
          </div>
        </div>
      </div>
    </>
  )
}
