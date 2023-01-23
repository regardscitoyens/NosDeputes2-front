import groupBy from 'lodash/groupBy'
import { WithLatestGroupOrNull } from './addLatestGroup'
import sortBy from 'lodash/sortBy'

export function getAge(date_naissance: string) {
  const dNaissance = new Date(date_naissance)
  const ageDifMs = Date.now() - dNaissance.getTime()
  const ageDate = new Date(ageDifMs)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

export function arrIfDefined<A>(a: A | undefined): A[] {
  if (a === undefined) {
    return []
  }
  return [a]
}

export function getOrdinalSuffixFeminine(n: number | string): string {
  if (typeof n === 'number') {
    return n === 1 ? 'ère' : `ème`
  }
  const nParsed = parseIntOrNull(n)
  if (nParsed !== null) {
    return getOrdinalSuffixFeminine(nParsed)
  }
  return 'ème'
}

export function formatYear(dateIsoString: string) {
  const str = new Date(dateIsoString).toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
  })
  return str
}

export function formatDateWithoutWeekday(dateIsoString: string) {
  const str = new Date(dateIsoString).toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return str
}
export function formatDate(
  dateIsoString: string,
  style: 'normal' | 'precise' | 'precise_with_time' = 'precise',
) {
  const str = new Date(dateIsoString).toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(style === 'precise_with_time'
      ? {
          hour: '2-digit',
          minute: '2-digit',
        }
      : {}),
  })
  return str
}

export function formatDateWithJustMonthAndYear(dateIsoString: string) {
  const str = new Date(dateIsoString).toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    // weekday: 'short',
    year: 'numeric',
    month: 'long',
    // day: 'numeric',
  })
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
export function pickTextColor(
  bgColor: string,
  tonedDown: boolean = false,
): string {
  const r = parseInt(bgColor.substring(1, 3), 16)
  const g = parseInt(bgColor.substring(3, 5), 16)
  const b = parseInt(bgColor.substring(5, 7), 16)
  const perceivedLuminosity = (r * 299 + g * 587 + b * 114) / 1000
  return perceivedLuminosity >= 150
    ? tonedDown
      ? 'text-slate-700'
      : 'text-black'
    : tonedDown
    ? 'text-slate-200'
    : 'text-white'
}

export function capitalizeFirstLetter(s: string): string {
  if (s.length > 0) return s.charAt(0).toUpperCase() + s.slice(1)
  return s
}

// Parition a bunch of deputes by their group. Groups with most members are returned first.
export function partitionDeputesByGroup<D>(
  deputes: WithLatestGroupOrNull<D>[],
): WithLatestGroupOrNull<D>[][] {
  return sortBy(
    Object.values(groupBy(deputes, _ => _.latestGroup?.acronym)),
    _ => -_.length,
  )
}

export function dateDiffInDays(first: string, second: string) {
  return Math.round(
    (new Date(second).getTime() - new Date(first).getTime()) /
      (1000 * 60 * 60 * 24),
  )
}

export function lastOfArray<A>(arr: A[]): A {
  return arr[arr.length - 1]
}
