import groupBy from 'lodash/groupBy'

export function getAge(date_naissance: string) {
  const dNaissance = new Date(date_naissance)
  const ageDifMs = Date.now() - dNaissance.getTime()
  const ageDate = new Date(ageDifMs)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

export function formatDate(dateIsoString: string) {
  const d = new Date(dateIsoString)
  const dd = d.getUTCDay().toString().padStart(2, '0')
  const mm = (d.getUTCMonth() + 1).toString().padStart(2, '0')
  const yyyy = d.getUTCFullYear()
  const res = `${dd}/${mm}/${yyyy}`
  return res
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

export function readFromEnv(name: string): string {
  const value = process.env[name]
  if (value === undefined) {
    throw new Error(`Missing env variable ${value}`)
  }
  return value
}

// partition an array into multiple chunks based on a predicate
export function chunkBy<A, B>(arr: A[], fn: (a: A) => B): A[][] {
  return Object.values(groupBy(arr, fn))
}

export function parseIntOrNull(str: string): number | null {
  const parsed = parseInt(str)
  if (isNaN(parsed)) return null
  return parsed
}
