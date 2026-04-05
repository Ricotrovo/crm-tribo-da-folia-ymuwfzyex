import { KpiCards } from '@/components/dashboard/kpi-cards'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockEvents, mockActivities } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

const Index = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <KpiCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-4">
          <FunnelChart />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
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
            <CardTitle className="text-lg">Next Events</CardTitle>
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
                        {evt.date} at {evt.time}
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
}

export default Index
