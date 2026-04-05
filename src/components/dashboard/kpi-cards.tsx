import { DollarSign, Users, CalendarCheck, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function KpiCards() {
  const kpis = [
    {
      title: 'Monthly Revenue',
      value: 'R$ 84,500',
      icon: DollarSign,
      trend: '+12% from last month',
      color: 'text-emerald-500',
    },
    { title: 'New Leads', value: '24', icon: Users, trend: '4 urgent', color: 'text-primary' },
    {
      title: 'Events this Week',
      value: '12',
      icon: CalendarCheck,
      trend: '8 Premium, 4 Kids',
      color: 'text-secondary',
    },
    {
      title: 'Stock Alerts',
      value: '3',
      icon: AlertCircle,
      trend: 'Requires attention',
      color: 'text-destructive',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, i) => (
        <Card
          key={i}
          className="transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            <kpi.icon
              className={`h-4 w-4 ${kpi.color} transition-transform group-hover:scale-110`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{kpi.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
