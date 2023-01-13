import useMouse from '@react-hook/mouse-position'
import { SvgLoader, SvgProxy } from 'react-svgmt'
import { useRef, useState } from 'react'
import { departements } from '../lib/hardcodedData'

export function MapFrance({
  onHover,
  onMouseOut,
  onClick,
  selected,
}: {
  onHover: Function
  onMouseOut: Function
  onClick: Function
  selected?: string
}) {
  const ref = useRef(null)
  const [titre, setTitre] = useState<null | string>(null)
  const mouse = useMouse(ref, {
    enterDelay: 100,
    leaveDelay: 100,
  })

  function onNodeOver(e: Event) {
    const path = e.target as SVGPathElement
    path.style.zIndex = '10'
    setTitre(path.querySelector('title')?.textContent ?? '')
    onHover(path.getAttribute('id')?.replace(/^d(.*)/, '$1'))
  }
  function onNodeOut(e: Event) {
    const path = e.target as SVGPathElement
    onMouseOut(path.getAttribute('id')?.replace(/^d(.*)/, '$1'))
    setTitre(null)
  }
  function onNodeClick(e: Event) {
    const path = e.target as SVGPathElement

    onClick(path.getAttribute('id')?.replace(/^d(.*)/, '$1'))
  }

  const tooltipStyle = {
    textAlign: 'center',
    position: 'absolute',
    left: mouse.pageX ? mouse.pageX + 15 : undefined,
    top: mouse.pageY ? mouse.pageY + 15 : undefined,
    width: 200,
    background: 'white',
    border: '1px solid #333',
    padding: 5,
  }
  return (
    <div ref={ref}>
      <SvgLoader
        width="400"
        height="400"
        path={'/circonscriptions/2012/departements.svg'}
        style={{
          width: '100%',
          height: '100%',
          strokeWidth: 3,
          margin: '0 auto',
        }}
      >
        {titre && mouse && mouse.x && mouse.x > 0 && mouse.y && mouse.y > 0 && (
          /* @ts-ignore */
          <div style={tooltipStyle}>
            <b>{titre}</b>
          </div>
        )}
        <SvgProxy
          selector={'path'}
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
        <SvgProxy selector={`path[id='d${selected}']`} fill="#D1EA74" />
      </SvgLoader>
    </div>
  )
}
