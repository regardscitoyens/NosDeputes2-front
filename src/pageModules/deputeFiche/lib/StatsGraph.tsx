import { TypeScriptConfig } from 'next/dist/server/config-shared'
import { useEffect, useState } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  YAxisProps,
} from 'recharts'
import { formatDate } from '../../../lib/utils'
import * as types from '../DeputeFiche.types'

export function StatsGraph({
  stats,
}: {
  stats: types.WeeklyStats<types.StatsFinal>
}) {
  const data = Object.entries(stats).map(([weekMonday, statsThisWeek]) => {
    return {
      name: weekMonday,
      presences: statsThisWeek.isVacances ? null : statsThisWeek.presences,
      mediane: statsThisWeek.isVacances
        ? null
        : statsThisWeek.mediane_presences,
      isVacances: statsThisWeek.isVacances ? 20 : null,
    }
  })

  return (
    <ResponsiveContainer>
      <ComposedChart
        data={data}
        margin={{ top: 10 }}
        barGap={'-100%'}
        barCategoryGap={0}
      >
        <CartesianGrid stroke="#999" strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 20]} />
        <Tooltip
          allowEscapeViewBox={{ y: true }}
          labelFormatter={(weekMonday: string) => {
            return 'Semaine du ' + formatDate(weekMonday)
          }}
          // formatter={(value, name, props) => {
          //   const betterName =
          //     name === 'isVacances'
          //       ? "Périodes de vacances pour l'Assemblée (pas de réunions ni séances en hémicycle). Ou période où ce député n'était pas encore en mandat"
          //       : name
          //   return [value, betterName]
          // }}
          content={({ payload }) => {
            if (!payload || payload.length === 0) {
              return null
            }

            console.log(payload)
            return (
              <div className="max-w-lg  bg-white p-4">
                {payload.map(item => {
                  if (item.name === 'isVacances') {
                    return (
                      <p key={item.name}>
                        Périodes de vacances pour l'Assemblée, ou période où ce
                        député n'était pas encore en mandat
                      </p>
                    )
                  }
                  const label =
                    item.name === 'presences'
                      ? "Présences détectées (en réunion ou dans l'hémicycle)"
                      : 'Médiane des présences de tous les députés'
                  const color =
                    item.name === 'presences'
                      ? 'rgba(0, 150, 0, 0.8)'
                      : 'rgba(0, 0, 255, 0.6)'
                  return (
                    <p key={item.name} style={{ color }}>
                      {label}: <span className="font-bold">{item.value}</span>
                    </p>
                  )
                })}
              </div>
            )
          }}
        />
        <Legend
          payload={[
            {
              value: 'Présences détectées',
              type: 'rect',
              color: 'rgba(0, 150, 0, 0.8)',
            },
            {
              value: 'Médiane des députés',
              type: 'circle',
              color: 'rgba(0, 0, 255, 0.6)',
            },
          ]}
        />{' '}
        <Bar
          // name="Présences détectées"
          dataKey="presences"
          stroke="rgb(0, 150, 0)"
          strokeWidth="2"
          //   strokeDasharray="5 5"
          fill="rgba(0, 150, 0, 0.3)"
          isAnimationActive={false}
        />
        <Line
          // name="Médiane des présences pour tous les députés"
          dataKey="mediane"
          stroke="rgba(0, 0, 255, 0.4)"
          strokeWidth="5"
          dot={false}
          isAnimationActive={false}
        />
        <Bar
          // name="Vacances de l'Assemblée (ou hors mandat)"
          dataKey="isVacances"
          fill="rgba(100, 100, 100, 0.3)"
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
