import { useState } from 'react'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { SvgLoader, SvgProxy } from 'react-svgmt'
import Image from 'next/image'
import { GroupeBadge } from '../../../components/GroupeBadge'

import {
  DeputeInDepartement,
  queryDeputesForDepartement,
} from '../../../lib/queryDeputesForDepartement'
import {
  getIdDepartement,
  CURRENT_LEGISLATURE,
} from '../../../lib/hardcodedData'
import Link from 'next/link'
import { useRouter } from 'next/router'

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
    // needs TS help here
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

const getSvgUrl = (idDepartement: string) => {
  const baseUrl = `/circonscriptions/2012/departements`
  let newDepartementId = `${idDepartement}`
  while (newDepartementId.length < 3) {
    newDepartementId = '0' + newDepartementId
  }
  return `${baseUrl}/${newDepartementId}.svg`
}

function MapDepartement({
  id,
  circonscription,
  onHover,
  ouMouseOut,
  onClick,
}: {
  id: string
  circonscription: string | null
  onHover: Function
  ouMouseOut: Function
  onClick: Function
}) {
  function onNodeOver(e) {
    console.log('this', this)
    this.style.zIndex = 10
    onHover({ id: this.getAttribute('id').replace(/^.*-(\d+)/, '$1') })
  }
  function onNodeOut(e) {
    ouMouseOut(this.getAttribute('id').replace(/^.*-(\d+)/, '$1'))
  }
  function onNodeClick(e) {
    onClick(this.getAttribute('id').replace(/^.*-(\d+)/, '$1'))
  }
  const paddedCirconscription =
    circonscription && circonscription.length < 2
      ? `0${circonscription}`
      : `${circonscription}`
  return (
    <SvgLoader
      width="400"
      height="400"
      path={getSvgUrl(id)}
      style={{
        width: '100%',
        height: '100%',
        strokeWidth: 3,
        fill: '#bfbfbf',
        stroke: '#eeeeee',
      }}
    >
      <SvgProxy
        selector={'.circo'}
        fill="inherit"
        stroke="inherit"
        onElementSelected={e => {
          Array.from(e).map((node: any) => {
            node.style.cursor = 'pointer'
            // todo: remove all listeners
            node.addEventListener('mouseover', onNodeOver)
            node.addEventListener('mouseout', onNodeOut)
            node.addEventListener('click', onNodeClick)
          })
        }}
      />
      <SvgProxy
        selector={`path.circo[id$='-${paddedCirconscription}']`}
        fill="#bec78f"
        stroke="#95a857"
      />
    </SvgLoader>
  )
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

  const onCirconscriptionHover = ({
    id,
    title,
    desc,
  }: {
    id: string
    title: string
    desc: string
  }) => {
    setCirconscription(id)
    //setCirconscriptionTitle$0.querySelector('desc').textContent
  }
  const onCirconscriptionClick = (circonscriptionId: string) => {
    console.log('click', circonscriptionId)
    const depute = deputes.find(
      depute => depute.num_circo === parseInt(circonscriptionId),
    )
    if (depute) {
      router.push(`/${depute.slug}`)
    }
  }
  const ouCirconscriptionMouseOut = (circonscriptionId: string) => {
    if (circonscription === circonscriptionId) {
      setCirconscription(null)
    }
  }

  const isCurrentCirconscription = (num_circo: number) => {
    return (
      circonscription &&
      num_circo === parseInt(circonscription.replace(/^id-\d+-(.*)/, '$1'))
    )
  }
  const onDeputeHover = (depute: DeputeInDepartement) => {
    setCirconscription(depute.num_circo.toString())
  }
  const onDeputeMouseOut = (depute: DeputeInDepartement) => {
    if (circonscription === depute.num_circo.toString()) {
      setCirconscription(null)
    }
  }
  return (
    <div className="grid grid-cols-12 gap-4">
      <h1 className="col-span-full text-center text-2xl">
        {nom} ({id})
      </h1>
      <div className="col-span-5 ">
        <div>
          <b>{deputes.length} députés</b>
        </div>
        {deputes.map(depute => {
          return (
            <li
              key={depute.id}
              onMouseOver={e => onDeputeHover(depute)}
              onMouseOut={e => onDeputeMouseOut(depute)}
              style={{
                cursor: 'pointer',
                marginBottom: 5,
                display: 'inline-block',
                listStyleType: 'none',
                padding: 5,
                background: isCurrentCirconscription(depute.num_circo)
                  ? '#d1ea7499'
                  : 'initial',
              }}
            >
              <Image
                width={40}
                height={60}
                alt={`Photo de ${depute.nom}`}
                src={`/deputes/photos/${CURRENT_LEGISLATURE}/${depute.id_an}.jpg`}
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
                  {depute.nom}
                </Link>{' '}
                - {beautifyNumeroCirconsription(depute.num_circo)}{' '}
                circonscription
                <br />
                député{(depute.sexe === 'F' && 'e') || null}{' '}
                <GroupeBadge groupe={{ acronym: depute.groupe_acronyme }} />
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
              ouMouseOut={ouCirconscriptionMouseOut}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
