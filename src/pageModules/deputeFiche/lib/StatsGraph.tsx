import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDate, formatDateWithJustMonthAndYear } from '../../../lib/utils'
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
        <XAxis
          dataKey="name"
          tickFormatter={weekMonday => {
            return formatDateWithJustMonthAndYear(weekMonday)
          }}
          minTickGap={100}
        />
        <YAxis domain={[0, 20]} />
        <Tooltip
          allowEscapeViewBox={{ y: true }}
          content={({ payload, label: weekMonday, ...rest }) => {
            if (!payload || payload.length === 0) {
              return null
            }
            return (
              <div className="max-w-lg  bg-white p-4">
                <p className="mb-1 text-center font-bold text-slate-400">
                  Semaine du {formatDate(weekMonday)}
                </p>
                {payload.map(item => {
                  if (item.name === 'isVacances') {
                    return (
                      <p key={item.name} className="italic">
                        Périodes de vacances pour l'Assemblée, ou bien cette
                        personne n'était pas encore député(e)
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
                      {label} :{' '}
                      <span className="text-lg font-bold">{item.value}</span>
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
          dataKey="presences"
          stroke="rgb(0, 150, 0)"
          strokeWidth="2"
          fill="rgba(0, 150, 0, 0.3)"
          isAnimationActive={false}
        />
        <Line
          dataKey="mediane"
          stroke="rgba(0, 0, 255, 0.4)"
          strokeWidth="5"
          dot={false}
          isAnimationActive={false}
        />
        <Bar
          dataKey="isVacances"
          fill="rgba(100, 100, 100, 0.3)"
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
