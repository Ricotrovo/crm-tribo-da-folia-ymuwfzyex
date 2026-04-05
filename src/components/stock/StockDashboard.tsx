import { useEffect, useState } from 'react'
import { getInventory, getUpcomingEvents } from '@/services/stock'
import { Card, CardContent } from '@/components/ui/card'
import { Package, AlertTriangle, CalendarDays } from 'lucide-react'

export function StockDashboard({ refreshKey }: { refreshKey: number }) {
  const [stats, setStats] = useState({ total: 0, belowMin: 0, events: 0 })

  useEffect(() => {
    Promise.all([getInventory(), getUpcomingEvents()]).then(([inv, evs]) => {
      setStats({
        total: inv.length,
        belowMin: inv.filter((p: any) => p.quantity < p.min_quantity).length,
        events: evs.length,
      })
    })
  }, [refreshKey])

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Produtos</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-900 rounded-full text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-rose-800 dark:text-rose-300">Abaixo do Mínimo</p>
            <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
              {stats.belowMin}
            </h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Eventos (7 dias)</p>
            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.events}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
