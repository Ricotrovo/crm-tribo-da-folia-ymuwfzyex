import { DollarSign, FileText, CalendarCheck, AlertCircle, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function KpiCards() {
  const kpis = [
    {
      title: 'Eventos este mês',
      value: '18',
      icon: CalendarCheck,
      trend: '6 Premium, 12 Kids',
      color: 'text-primary',
    },
    {
      title: 'Contratos pendentes',
      value: '4',
      icon: FileText,
      trend: 'Aguardando assinatura',
      color: 'text-amber-500',
    },
    {
      title: 'Contas a receber',
      value: 'R$ 8.300',
      icon: DollarSign,
      trend: '+12% vs mês anterior',
      color: 'text-emerald-500',
    },
    {
      title: 'Estoque baixo',
      value: '3 itens',
      icon: AlertCircle,
      trend: 'Requer atenção imediata',
      color: 'text-destructive',
    },
    {
      title: 'Freelancers disponíveis',
      value: '8',
      icon: Users,
      trend: 'Próximo final de semana',
      color: 'text-blue-500',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi, i) => (
        <Card
          key={i}
          className="transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate pr-2">
              {kpi.title}
            </CardTitle>
            <kpi.icon
              className={`h-4 w-4 shrink-0 ${kpi.color} transition-transform group-hover:scale-110`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{kpi.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
