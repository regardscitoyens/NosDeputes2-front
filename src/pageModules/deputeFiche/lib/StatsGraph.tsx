import { TypeScriptConfig } from 'next/dist/server/config-shared'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import * as types from '../DeputeFiche.types'

export function StatsGraph({
  stats,
}: {
  stats: types.WeeklyStats<types.StatsFinal>
}) {
  // for now we render it client side only
  // we had issues with SSR, see https://github.com/recharts/recharts/issues/2272
  // we can try again later
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    setRendered(true)
  }, [])

  if (!rendered) {
    return null
  }

  const data = Object.entries(stats).map(([weekMonday, statsThisWeek]) => {
    return {
      name: weekMonday,
      presences: statsThisWeek.presences,
      mediane: statsThisWeek.mediane_presences,
    }
  })

  return (
    <ResponsiveContainer>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis domain={[0, 20]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="presences" fill="#8884d8" />
        {/* <Bar dataKey="mediane" fill="gray" /> */}
      </BarChart>
    </ResponsiveContainer>
  )
}
