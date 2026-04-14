import { DollarSign, FileText, CalendarCheck, AlertCircle, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type KpiData = {
  title: string
  value: string | number
  icon: any
  trend: string
  color: string
}

export function KpiCards({ kpis = [] }: { kpis?: KpiData[] }) {
  if (!kpis || kpis.length === 0) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon
        return (
          <Card
            key={i}
            className="transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground truncate pr-2">
                {kpi.title}
              </CardTitle>
              <Icon
                className={`h-4 w-4 shrink-0 ${kpi.color} transition-transform group-hover:scale-110`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{kpi.trend}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
