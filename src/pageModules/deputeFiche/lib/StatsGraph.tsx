import { TypeScriptConfig } from 'next/dist/server/config-shared'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  YAxisProps,
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
      <BarChart
        data={data}
        margin={{ top: 10 }}
        barGap={'-100%'}
        barCategoryGap={0}
      >
        <CartesianGrid stroke="#999" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 20]} />
        <Tooltip />
        {/* <Legend /> */}
        <Bar
          dataKey="mediane"
          stroke="rgba(100, 100, 100, 1)"
          //   strokeDasharray="5 5"
          fill="rgba(100, 100, 100, 0.3)"
          isAnimationActive={false}
        />
        <Bar
          dataKey="presences"
          stroke="rgb(0, 150, 0)"
          strokeWidth="2"
          //   strokeDasharray="5 5"
          fill="rgba(0, 150, 0, 0.3)"
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
