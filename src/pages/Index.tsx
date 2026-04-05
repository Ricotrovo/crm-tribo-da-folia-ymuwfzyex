import { KpiCards } from '@/components/dashboard/kpi-cards'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { mockEvents, mockActivities, mockStock } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { CalendarCheck, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const Index = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (!user) return null

  const renderAdminDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <KpiCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-4">
          <FunnelChart />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-4 text-sm">
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${act.type === 'sale' ? 'bg-primary' : act.type === 'system' ? 'bg-destructive' : 'bg-secondary'}`}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">{act.action}</p>
                      <p className="text-muted-foreground text-xs">
                        {act.user} • {act.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{evt.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <span>
                        {evt.date} às {evt.time}
                      </span>
                      <span>•</span>
                      <span>{evt.client}</span>
                    </div>
                  </div>
                  <Badge variant={evt.salon === 'Premium' ? 'default' : 'secondary'}>
                    {evt.salon}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderGerenteDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <KpiCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.slice(0, 3).map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{evt.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {evt.date} às {evt.time}
                    </p>
                  </div>
                  <Badge variant="outline">{evt.salon}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alertas Recentes do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities
                .filter((a) => a.type === 'system')
                .map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{act.action}</p>
                      <p className="text-xs text-muted-foreground">{act.time}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderVendedorDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Meus Leads Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Contratos Fechados (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Meta de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">80%</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FunnelChart />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Eventos (Meus Clientes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.slice(0, 3).map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{evt.title}</p>
                    <p className="text-xs text-muted-foreground">{evt.client}</p>
                  </div>
                  <Badge variant="outline">{evt.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCozinhaDashboard = () => {
    const lowStock = mockStock.filter((s) => s.qty < s.minQty)

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Itens em Falta/Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                {lowStock.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Eventos Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alertas de Estoque</CardTitle>
            <CardDescription>
              Itens que precisam ser comprados ou repostos urgentemente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-background"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">
                      {item.qty}{' '}
                      <span className="text-xs font-normal text-muted-foreground">
                        / min {item.minQty}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              {lowStock.length === 0 && (
                <p className="text-muted-foreground">Estoque regularizado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderFreelancerDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Sua Disponibilidade</CardTitle>
          <CardDescription>
            Atualize seu status para os próximos finais de semana e facilite a escala.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button className="w-full sm:w-auto">
            <CalendarCheck className="mr-2 h-4 w-4" /> Informar Disponibilidade
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Trabalhos Confirmados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEvents.slice(0, 2).map((evt) => (
              <div
                key={evt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div>
                  <p className="font-semibold">{evt.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {evt.date} às {evt.time} • Salão {evt.salon}
                  </p>
                </div>
                <Badge className="bg-emerald-500 w-fit">Confirmado</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSkeletons = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="h-[400px] md:col-span-4 rounded-xl" />
        <Skeleton className="h-[400px] md:col-span-3 rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Bem-vindo de volta, <span className="font-medium text-foreground">{user.name}</span>!
            Aqui está o seu resumo.
          </p>
        </div>
      </div>

      {isLoading ? (
        renderSkeletons()
      ) : (
        <>
          {user.role === 'admin' && renderAdminDashboard()}
          {user.role === 'gerente' && renderGerenteDashboard()}
          {user.role === 'vendedor' && renderVendedorDashboard()}
          {user.role === 'cozinha' && renderCozinhaDashboard()}
          {user.role === 'freelancer' && renderFreelancerDashboard()}
        </>
      )}
    </div>
  )
}

export default Index
