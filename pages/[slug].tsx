import { useRouter } from 'next/router'

const PageDepute = () => {
  const router = useRouter()
  const slug = router.query.slug as string

  return <p>Fiche du depute {slug}</p>
}

export default PageDepute
