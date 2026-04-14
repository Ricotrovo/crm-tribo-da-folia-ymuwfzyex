import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const chartConfig = {
  leads: {
    label: 'Leads',
    color: 'hsl(var(--primary))',
  },
}

export function FunnelChart({ data = [] }: { data?: { stage: string; leads: number }[] }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-lg">Funil de Vendas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        {data.length === 0 || data.every((d) => d.leads === 0) ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-muted/10">
            Nenhum lead encontrado
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="stage" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent />} />
              <Bar
                dataKey="leads"
                fill="var(--color-leads)"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
