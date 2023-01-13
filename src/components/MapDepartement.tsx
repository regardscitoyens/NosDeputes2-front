import { useRef, useState } from 'react'
import { SvgLoader, SvgProxy } from 'react-svgmt'
import useMouse from '@react-hook/mouse-position'

const getSvgUrl = (idDepartement: string) => {
  const baseUrl = `/circonscriptions/2012/departements`
  let newDepartementId = `${idDepartement}`
  while (newDepartementId.length < 3) {
    newDepartementId = '0' + newDepartementId
  }
  return `${baseUrl}/${newDepartementId}.svg`
}

export function MapDepartement({
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
    onHover(path.getAttribute('id')?.replace(/^.*-(\d+)/, '$1'))
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
