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
