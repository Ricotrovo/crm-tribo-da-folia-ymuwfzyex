import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import { Users, AlertCircle, DollarSign, FileText, CalendarCheck } from 'lucide-react'
import { format } from 'date-fns'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { KpiCards, KpiData } from '@/components/dashboard/kpi-cards'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtime } from '@/hooks/use-realtime'

export default function Index() {
  const [kpis, setKpis] = useState<KpiData[]>([])
  const [funnelData, setFunnelData] = useState<any[]>([])
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const d = new Date()
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]

      const [eventsRes, contractsRes, paymentsRes, stockRes, freelancersRes, leadsRes] =
        await Promise.all([
          pb
            .collection('events')
            .getFullList({
              filter: `date >= '${today}' && date <= '${endOfMonth}'`,
              sort: 'date',
            })
            .catch(() => []),
          pb
            .collection('contracts')
            .getFullList()
            .catch(() => []),
          pb
            .collection('payments')
            .getFullList({
              filter: `status = 'Pendente'`,
            })
            .catch(() => []),
          pb
            .collection('stock')
            .getFullList({
              filter: `quantity <= 10`,
            })
            .catch(() => []),
          pb
            .collection('freelancers')
            .getFullList({
              filter: `status = 'Ativo'`,
            })
            .catch(() => []),
          pb
            .collection('leads')
            .getFullList()
            .catch(() => []),
        ])

      const eventsThisMonth = eventsRes.length
      const premiumCount = eventsRes.filter((e: any) => e.salon === 'Premium').length
      const kidsCount = eventsRes.filter((e: any) => e.salon === 'Kids&Teens').length

      const pendingReceivables = paymentsRes.reduce(
        (acc: number, curr: any) => acc + Number(curr.amount || 0),
        0,
      )

      setKpis([
        {
          title: 'Eventos este mês',
          value: eventsThisMonth.toString(),
          icon: CalendarCheck,
          trend: `${premiumCount} Premium, ${kidsCount} Kids`,
          color: 'text-primary',
        },
        {
          title: 'Contratos pendentes',
          value: contractsRes.length.toString(),
          icon: FileText,
          trend: 'Aguardando assinatura',
          color: 'text-amber-500',
        },
        {
          title: 'Contas a receber',
          value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            pendingReceivables,
          ),
          icon: DollarSign,
          trend: 'Pendentes',
          color: 'text-emerald-500',
        },
        {
          title: 'Estoque baixo',
          value: `${stockRes.length} itens`,
          icon: AlertCircle,
          trend: 'Requer atenção imediata',
          color: 'text-destructive',
        },
        {
          title: 'Freelancers disponíveis',
          value: freelancersRes.length.toString(),
          icon: Users,
          trend: 'Equipe ativa',
          color: 'text-blue-500',
        },
      ])

      const statuses = ['Novo', 'Contato Inicial', 'Proposta', 'Visita', 'Fechado']
      const funnel = statuses.map((stage) => ({
        stage,
        leads: leadsRes.filter((l: any) => l.status === stage).length,
      }))
      setFunnelData(funnel)

      const upcoming = [...eventsRes].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)
      setRecentEvents(upcoming)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useRealtime('events', () => fetchDashboardData())
  useRealtime('leads', () => fetchDashboardData())
  useRealtime('contracts', () => fetchDashboardData())
  useRealtime('payments', () => fetchDashboardData())

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-[350px] w-full rounded-xl" />
          <Skeleton className="h-[350px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio hoje.</p>
      </div>

      <KpiCards kpis={kpis} />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <FunnelChart data={funnelData} />

        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.client_name || 'Sem cliente'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {event.date
                        ? format(new Date(event.date + 'T00:00:00'), 'dd/MM/yyyy')
                        : 'Sem data'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.time || '--:--'} • {event.salon || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <div className="flex h-full min-h-[150px] items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-muted/10">
                  Nenhum evento programado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
