import groupBy from 'lodash/groupBy'

export function getAge(date_naissance: string) {
  const dNaissance = new Date(date_naissance)
  const ageDifMs = Date.now() - dNaissance.getTime()
  const ageDate = new Date(ageDifMs)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

export function formatDate(dateIsoString: string) {
  const str = new Date(dateIsoString)
    .toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
    })
    .split(' ')[0]
  return str
}

export function formatDateWithTimeAndWeekday(dateIsoString: string) {
  const d = new Date(dateIsoString)
  const weekday = d.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
  })
  const [date, time] = d
    .toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
    })
    .split(' ')
  const [hour, minutes] = time.split(':')
  return `${weekday} ${date} à ${noLeadingZero(hour)}h${
    minutes != '00' ? minutes : ''
  }`
}

// from https://weeknumber.com/how-to/javascript
// there are a bunch of other implementations here https://stackoverflow.com/questions/9045868/javascript-date-getweek
// I don't know which is one is most correct
export function getWeek(date: Date): number {
  const d = new Date(date.getTime())
  // Returns the ISO week of the date.
  d.setHours(0, 0, 0, 0)
  // Thursday in current week decides the year.
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  // January 4 is always in week 1.
  var week1 = new Date(d.getFullYear(), 0, 4)
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  )
}

// from https://weeknumber.com/how-to/javascript
// Returns the four-digit year corresponding to the ISO week of the date.
export function getWeekYear(date: Date) {
  const d = new Date(date.getTime())
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  return d.getFullYear()
}

function noLeadingZero(number: string) {
  return parseInt(number, 10).toString()
}

export function uniqBy<A, B>(arr: A[], fn: (a: A) => B): A[] {
  const foundAlready: B[] = []
  return arr.filter(a => {
    const b = fn(a)
    if (foundAlready.includes(b)) {
      return false
    }
    foundAlready.push(b)
    return true
  })
}

export function notNull<A>(value: A | null): value is A {
  return value !== null
}

export function notUndefined<A>(value: A | undefined): value is A {
  return value !== undefined
}

export function readFromEnv(name: string): string {
  const value = process.env[name]
  if (value === undefined) {
    throw new Error(`Missing env variable ${value}`)
  }
  return value
}

export function readIntFromEnv(name: string): number {
  const res = parseIntOrNull(readFromEnv(name))
  if (res === null) {
    throw new Error(`env variable ${name} is not a integer`)
  }
  return res
}

// partition an array into multiple chunks based on a predicate
export function chunkBy<A, B>(arr: A[], fn: (a: A) => B): A[][] {
  return Object.values(groupBy(arr, fn))
}

function parseIntOrNull(str: string): number | null {
  const parsed = parseInt(str)
  if (isNaN(parsed)) return null
  return parsed
}
// https://stackoverflow.com/questions/11867545/change-text-color-based-on-brightness-of-the-covered-background-area
export function pickTextColor(bgColor: string): 'text-white' | 'text-black' {
  const r = parseInt(bgColor.substring(1, 3), 16)
  const g = parseInt(bgColor.substring(3, 5), 16)
  const b = parseInt(bgColor.substring(5, 7), 16)
  const perceivedLuminosity = (r * 299 + g * 587 + b * 114) / 1000
  return perceivedLuminosity >= 150 ? 'text-black' : 'text-white'
}
