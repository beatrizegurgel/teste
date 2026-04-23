import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

export function Sparkline({ data, color = '#F5C842', height = 40 }) {
  const chartData = data.map((v, i) => ({ x: i, y: v }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Line
          type="monotone"
          dataKey="y"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
