/* script to extract departements from france.svg */

const fs = require('fs')
//@ts-ignore
const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const document = window.document
const { SVG, registerWindow, Path } = require('@svgdotjs/svg.js')
const { SVGPathData } = require('svg-pathdata')

// register window and document
registerWindow(window, document)

const SVG_PATH = './2012'

// loads france.svg
const rawSvg = fs.readFileSync(`${SVG_PATH}/france.svg`).toString()
const france = SVG().size(600, 600).svg(rawSvg)

// build list of uniques available zones in the SVG - "ab" if for "Corsica"
const matchRegexp = new RegExp('^([\\dab]+)-\\d+$', 'i')
const zones = Array.from(
  new Set(
    france
      .find(`path.circo`)
      .filter(path => path.attr('id').match(matchRegexp))
      .map(path => {
        return path.attr('id').replace(matchRegexp, '$1')
      }),
  ),
).sort()

// extract each zone and its circos into its own SVG
zones.forEach(zone => {
  const tmpSvg = SVG()
  const circosSvg = france.find(`*[id^=${zone}-]`)
  circosSvg.forEach(svg => tmpSvg.add(svg))
  const bbox = tmpSvg.bbox()
  const outSvg = SVG()

  tmpSvg.find('path.circo').forEach(circoSvg => {
    const pathData = new SVGPathData(circoSvg.plot().toString())
    const pathTranslated = pathData
      .translate(-bbox.x, -bbox.y)
      .scale(5) // make it big by default
      .encode()
    circoSvg.plot(pathTranslated)

    // fix path ids to be SVG compatible ( The id value must begin with a letter ([A-Za-z]))
    circoSvg.attr('id', `id-${circoSvg.attr('id')}`)
    outSvg.add(circoSvg)
  })
  const bbox2 = outSvg.bbox()
  outSvg.size(bbox2.width, bbox2.height)

  // make borders visible
  outSvg
    .fill('#eee')
    .stroke('#ccc')
    .attr(
      'xmlns:sodipodi',
      'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
    )
  const outSvgPath = `${SVG_PATH}/departements`
  if (!fs.existsSync(outSvgPath)) {
    fs.mkdirSync(outSvgPath)
  }
  fs.writeFileSync(`${outSvgPath}/${zone}.svg`, outSvg.svg())
  console.info(`✅ Wrote ${outSvgPath}/${zone}.svg`)
})
