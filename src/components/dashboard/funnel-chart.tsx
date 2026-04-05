import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const chartData = [
  { stage: 'Contact', leads: 45 },
  { stage: 'Visit', leads: 30 },
  { stage: 'Negotiation', leads: 15 },
  { stage: 'Closed', leads: 8 },
]

const chartConfig = {
  leads: {
    label: 'Leads',
    color: 'hsl(var(--primary))',
  },
}

export function FunnelChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Sales Funnel</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="stage" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent />} />
            <Bar dataKey="leads" fill="var(--color-leads)" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
