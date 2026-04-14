import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { Users, AlertCircle, DollarSign, FileText, CalendarCheck } from 'lucide-react'
import { format } from 'date-fns'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { KpiCards, KpiData } from '@/components/dashboard/kpi-cards'
import { Skeleton } from '@/components/ui/skeleton'

export default function Index() {
  const [kpis, setKpis] = useState<KpiData[]>([])
  const [funnelData, setFunnelData] = useState<any[]>([])
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
          .toISOString()
          .split('T')[0]

        const [
          eventsRes,
          contractsRes,
          paymentsRes,
          stockRes,
          freelancersRes,
          leadsRes,
          recentEventsRes,
        ] = await Promise.all([
          supabase.from('events').select('*').gte('date', today).lte('date', endOfMonth),
          supabase.from('contracts').select('id', { count: 'exact' }).eq('status', 'Pending'),
          supabase.from('payments').select('amount').eq('status', 'Pendente'),
          supabase
            .from('stock' as any)
            .select('id', { count: 'exact' })
            .lte('quantity', 10),
          supabase
            .from('freelancers' as any)
            .select('id', { count: 'exact' })
            .eq('status', 'Ativo'),
          supabase.from('leads').select('status'),
          supabase
            .from('events')
            .select('*')
            .gte('date', today)
            .order('date', { ascending: true })
            .limit(5),
        ])

        const eventsThisMonth = eventsRes.data?.length || 0
        const premiumCount = eventsRes.data?.filter((e) => e.salon === 'Premium').length || 0
        const kidsCount = eventsRes.data?.filter((e) => e.salon === 'Kids&Teens').length || 0

        const pendingReceivables =
          paymentsRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

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
            value: (contractsRes.count || 0).toString(),
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
            value: `${stockRes.count || 0} itens`,
            icon: AlertCircle,
            trend: 'Requer atenção imediata',
            color: 'text-destructive',
          },
          {
            title: 'Freelancers disponíveis',
            value: (freelancersRes.count || 0).toString(),
            icon: Users,
            trend: 'Equipe ativa',
            color: 'text-blue-500',
          },
        ])

        const statuses = ['Novo', 'Contato Inicial', 'Proposta', 'Visita', 'Fechado']
        const funnel = statuses.map((stage) => ({
          stage,
          leads: leadsRes.data?.filter((l) => l.status === stage).length || 0,
        }))
        setFunnelData(funnel)

        if (recentEventsRes.data) {
          setRecentEvents(recentEventsRes.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
                    <p className="text-xs text-muted-foreground mt-0.5">{event.client_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {format(new Date(event.date), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.time} • {event.salon}
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
