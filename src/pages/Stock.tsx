import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StockDashboard } from '@/components/stock/StockDashboard'
import { StockTable } from '@/components/stock/StockTable'
import { MovementsTable } from '@/components/stock/MovementsTable'
import { ShoppingList } from '@/components/stock/ShoppingList'
import { MovementDialog } from '@/components/stock/MovementDialog'

export default function Stock() {
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey((k) => k + 1)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estoque & Produção</h2>
          <p className="text-muted-foreground">Gerencie insumos, lote e lista de compras.</p>
        </div>
        <MovementDialog onMovementAdded={refresh} />
      </div>

      <StockDashboard refreshKey={refreshKey} />

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList>
          <TabsTrigger value="inventory">Estoque Atual</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="shopping">Lista de Compras</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <StockTable refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="movements">
          <MovementsTable refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="shopping">
          <ShoppingList refreshKey={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
