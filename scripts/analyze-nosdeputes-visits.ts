import fs from 'fs'
import _ from 'lodash'

console.log(
  'Script to analyze visits data exported from the Matomo of www.nosdeputes.fr',
)

const file = './scripts/tmp/matomo.json'

type Row = { label: string; nb_visits: number }

const rows = JSON.parse(fs.readFileSync(file).toString('utf-8')) as Row[]

console.log('Parsed the file content')

const rowsByPageType = _.groupBy(rows, row => {
  const pageType = buildPageType(row.label)
  return pageType
})

const sumVisitsByPageType = _.mapValues(rowsByPageType, row =>
  _.sum(row.map(_ => _.nb_visits)),
)

function buildPageType(label: string) {
  if (label.startsWith('/groupe/')) {
    return '/groupe/[acronym]'
  }
  if (label.startsWith('/citoyen/')) {
    return '/citoyen/[slug]'
  }
  if (label.startsWith('/organisme/')) {
    return '/organisme/[slug]'
  }
  if (label.startsWith('/16/dossier/')) {
    return '/16/dossier/[id]'
  }
  if (label.startsWith('/16/scrutin/')) {
    return '/16/scrutin/[id]'
  }
  if (label.startsWith('/16/seance/')) {
    return '/16/seance/[id]'
  }
  if (label.startsWith('/16/question/QE')) {
    return '/16/question/QE/[id]'
  }
  if (label.startsWith('/16/document/')) {
    return '/16/document/[id]'
  }

  if (label.startsWith('/alerte/')) {
    return '/alerte/[diverses urls liees aux alertes]'
  }
  if (label.startsWith('/synthesetri/')) {
    return '/synthesetri/[something]'
  }
  if (label.startsWith('/16/amendement/')) {
    return '/16/amendement/[id]/[id]'
  }
  if (label.startsWith('/recherche/')) {
    return '/recherche/[x]'
  }
  if (label.startsWith('/16/intervention/')) {
    return '/16/intervention/[id]'
  }
  if (label.startsWith('/circonscription/departement/')) {
    return '/circonscription/departement/[dpt]'
  }
  if (label.match(/^\/[a-z\-]+$/) !== null) {
    return '/[depute]'
  }
  if (label.match(/^\/16\/[a-z\-]+\/dossier\//) !== null) {
    return '/16/[depute]/dossier/[id]'
  }
  return label
}

const sortedResults = _.sortBy(Object.entries(sumVisitsByPageType), _ => _[1])

const sum = _.sum(sortedResults.map(_ => _[1]))

console.log('Results =======')
sortedResults.forEach(([pageType, nb]) => {
  const percent = (nb / sum) * 100
  const roundedPercent = Math.round(percent * 100) / 100
  console.log(pageType, '->', nb, 'visites (', roundedPercent, '%)')
})
