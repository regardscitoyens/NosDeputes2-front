import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import { GroupeBadge } from '../../../components/GroupeBadge'

import {
  DeputeInDepartement,
  queryDeputesForDepartement,
} from '../../../lib/queryDeputesForDepartement'
import {
  getIdDepartement,
  LATEST_LEGISLATURE,
} from '../../../lib/hardcodedData'
import { MapDepartement } from '../../../components/MapDepartement'

type Data = {
  departement: {
    nom: string
    id: string
  }
  deputes: DeputeInDepartement[]
}

export const getServerSideProps: GetServerSideProps<{
  data: Data
}> = async context => {
  const nomDepartement = context.query.nom_departement
  if (!nomDepartement || Array.isArray(nomDepartement)) {
    throw new Error(`Mandatory ${nomDepartement}`)
  }
  const idDepartement = getIdDepartement(nomDepartement)
  const deputes = await queryDeputesForDepartement(nomDepartement)
  return {
    props: {
      data: {
        deputes,
        departement: {
          nom: nomDepartement,
          id: idDepartement,
        },
      },
    },
  }
}

const beautifyNumeroCirconsription = (num: number) => {
  if (num === 1) return '1ère'
  return `${num}ème`
}

export default function Page({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [circonscription, setCirconscription] = useState<null | string>(null)
  const {
    departement: { nom, id },
    deputes,
  } = data
  const router = useRouter()

  const onCirconscriptionHover = (id: string) => {
    setCirconscription(id)
  }

  const onCirconscriptionClick = (circonscriptionId: string) => {
    const depute = deputes.find(
      depute => depute.circo_number === parseInt(circonscriptionId),
    )
    if (depute) {
      router.push(`/${depute.slug}`)
    }
  }
  const onCirconscriptionMouseOut = (circonscriptionId: string) => {
    setCirconscription(null)
  }

  const isCurrentCirconscription = (circo_number: number) => {
    return (
      circonscription &&
      circo_number === parseInt(circonscription.replace(/^id-\d+-(.*)/, '$1'))
    )
  }
  const onDeputeHover = (depute: DeputeInDepartement) => {
    setCirconscription(depute.circo_number.toString())
  }
  const onDeputeMouseOut = (depute: DeputeInDepartement) => {
    setCirconscription(null)
  }
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full text-center">
        <div className="mx-auto my-4 w-[52rem] rounded-xl bg-slate-200 p-5">
          <h1 className="text-center text-4xl font-extrabold">
            {nom} ({id})
          </h1>
        </div>
      </div>

      <div className="col-span-5 pl-10">
        <div>
          <b>{deputes.length} députés</b>
        </div>
        {deputes.map(depute => {
          return (
            <li
              key={depute.uid}
              onMouseOver={e => onDeputeHover(depute)}
              onMouseOut={e => onDeputeMouseOut(depute)}
              style={{
                cursor: 'pointer',
                marginBottom: 5,
                display: 'inline-block',
                listStyleType: 'none',
                padding: 5,
                background: isCurrentCirconscription(depute.circo_number)
                  ? '#d1ea7499'
                  : 'initial',
              }}
            >
              <Image
                width={40}
                height={60}
                alt={`Photo de ${depute.full_name}`}
                src={`/deputes/photos/${LATEST_LEGISLATURE}/${depute.uid.substring(
                  2,
                )}.jpg`}
                style={{ display: 'inline-block', verticalAlign: 'top' }}
              />
              <div
                style={{
                  display: 'inline-block',
                  marginLeft: 10,
                }}
              >
                <Link
                  style={{ textDecoration: 'underline' }}
                  href={`/${depute.slug}`}
                >
                  {depute.full_name}
                </Link>{' '}
                - {beautifyNumeroCirconsription(depute.circo_number)}{' '}
                circonscription
                <br />
                député(e) <GroupeBadge groupe={depute.latestGroup} />
              </div>
            </li>
          )
        })}
      </div>
      <div className="col-span-7 ">
        <div className="bg-slate-200  px-8 py-4 shadow-md">
          <div className="py-4">
            <MapDepartement
              id={id}
              circonscription={circonscription}
              onHover={onCirconscriptionHover}
              onClick={onCirconscriptionClick}
              ouMouseOut={onCirconscriptionMouseOut}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
