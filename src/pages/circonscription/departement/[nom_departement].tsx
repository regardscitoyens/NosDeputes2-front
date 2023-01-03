import { useRef, useState } from 'react'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { SvgLoader, SvgProxy } from 'react-svgmt'
import Image from 'next/image'
import { GroupeBadge } from '../../../components/GroupeBadge'
import useMouse from '@react-hook/mouse-position'

import {
  DeputeInDepartement,
  queryDeputesForDepartement,
} from '../../../lib/queryDeputesForDepartement'
import {
  getIdDepartement,
  LATEST_LEGISLATURE,
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
  const ref = useRef(null)
  const [titre, setTitre] = useState<null | string>(null)
  const [description, setDescription] = useState<null | string>(null)
  const mouse = useMouse(ref, {
    enterDelay: 100,
    leaveDelay: 100,
  })

  function onNodeOver(e: Event) {
    const path = e.target as SVGPathElement
    path.style.zIndex = '10'
    setTitre(path.querySelector('title')?.textContent ?? '')
    setDescription(path.querySelector('desc')?.textContent ?? '')
    onHover({ id: path.getAttribute('id')?.replace(/^.*-(\d+)/, '$1') })
  }
  function onNodeOut(e: Event) {
    const path = e.target as SVGPathElement
    ouMouseOut(path.getAttribute('id')?.replace(/^.*-(\d+)/, '$1'))
  }
  function onNodeClick(e: Event) {
    const path = e.target as SVGPathElement
    onClick(path.getAttribute('id')?.replace(/^.*-(\d+)/, '$1'))
  }
  const paddedCirconscription =
    circonscription && circonscription.length < 2
      ? `0${circonscription}`
      : `${circonscription}`

  const tooltipStyle = {
    position: 'absolute',
    left: mouse.pageX ? mouse.pageX + 15 : undefined,
    top: mouse.pageY ? mouse.pageY + 15 : undefined,
    //top: mouse.pageY + 5 || undefined,
    width: 600,
    background: 'white',
    border: '1px solid #333',
    padding: 5,
  }
  return (
    <div ref={ref}>
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
          //'pointer-events': 'none',
        }}
      >
        {circonscription &&
          mouse &&
          mouse.x &&
          mouse.x > 0 &&
          mouse.y &&
          mouse.y > 0 && (
            /* @ts-ignore */
            <div style={tooltipStyle}>
              <b>{titre}</b>
              <br />
              {description}
            </div>
          )}
        <SvgProxy
          selector={'.circo'}
          fill="inherit"
          stroke="inherit"
          onElementSelected={(e: any) => {
            const paths = Array.from(e) as SVGPathElement[]
            paths.map(path => {
              path.style.cursor = 'pointer'
              // todo: remove all listeners
              path.addEventListener('mouseover', onNodeOver)
              path.addEventListener('mouseout', onNodeOut)
              path.addEventListener('click', onNodeClick)
            })
          }}
        />
        <SvgProxy
          selector={`path.circo[id$='-${paddedCirconscription}']`}
          fill="#bec78f"
          stroke="#95a857"
        />
      </SvgLoader>
    </div>
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
