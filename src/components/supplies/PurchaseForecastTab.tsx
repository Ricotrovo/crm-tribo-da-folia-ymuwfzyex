import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import pb from '@/lib/pocketbase/client'
import { calculateIngredientRequirement, getUnitHint } from '@/lib/scaling'
import { format, addDays } from 'date-fns'
import { Search, Loader2, Download } from 'lucide-react'

export function PurchaseForecastTab() {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
  const [forecast, setForecast] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const generateForecast = async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      const events = await pb
        .collection('events')
        .getFullList({ filter: `date >= "${startDate}" && date <= "${endDate}"` })
      const menus = await pb.collection('menus').getFullList()
      const menuDishes = await pb.collection('menu_dishes').getFullList()
      const menuItems = await pb.collection('menu_items').getFullList()
      const dishIngredients = await pb.collection('dish_ingredients').getFullList()
      const allItems = await pb.collection('items').getFullList()

      const itemNeeds: Record<string, number> = {}

      for (const ev of events) {
        const guests = ev.guests || 0
        if (guests <= 0) continue

        const matchedMenu = menus.find(
          (m) => m.name.toLowerCase() === (ev.menu || '').toLowerCase(),
        )
        let evDishesIds: string[] = []
        let evItemsNeeds: { itemId: string; qty: number }[] = []

        if (matchedMenu) {
          evDishesIds = menuDishes
            .filter((md) => md.menu_id === matchedMenu.id)
            .map((md) => md.dish_id)
          const mItems = menuItems.filter((mi) => mi.menu_id === matchedMenu.id)
          for (const mi of mItems) {
            // For flat extras, assume the quantity represents base 50 standard and scale linearly as simple fraction fallback
            // since AC specifically mentions ingredient fractioning logic.
            const scaledQty = calculateIngredientRequirement(mi.quantity, mi.quantity * 0.2, guests)
            evItemsNeeds.push({ itemId: mi.item_id, qty: scaledQty })
          }
        }

        // Apply scaling to ingredients of dishes
        for (const dId of evDishesIds) {
          const ings = dishIngredients.filter((di) => di.dish_id === dId)
          for (const ing of ings) {
            const req = calculateIngredientRequirement(
              ing.base_quantity_50,
              ing.increment_quantity_10,
              guests,
            )
            itemNeeds[ing.item_id] = (itemNeeds[ing.item_id] || 0) + req
          }
        }

        for (const en of evItemsNeeds) {
          itemNeeds[en.itemId] = (itemNeeds[en.itemId] || 0) + en.qty
        }
      }

      const results = []
      for (const itemId in itemNeeds) {
        const item = allItems.find((i) => i.id === itemId)
        if (!item || item.type !== 'product') continue

        const needed = itemNeeds[itemId]
        const stock = item.stock_quantity || 0
        const toBuy = Math.max(needed - stock, 0)

        if (needed > 0) {
          results.push({ id: item.id, name: item.name, unit: item.unit, needed, stock, toBuy })
        }
      }

      setForecast(results.sort((a, b) => b.toBuy - a.toBuy))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const csv = [
      ['Item', 'Necessidade', 'Estoque', 'Déficit (Comprar)'],
      ...forecast.map((i) => [i.name, i.needed.toFixed(3), i.stock.toFixed(3), i.toBuy.toFixed(3)]),
    ]
      .map((e) => e.join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `previsao_${startDate}_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inteligência de Estoque</CardTitle>
          <CardDescription>
            Calcule os suprimentos necessários com base nos eventos e cardápios programados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label>Data Inicial</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2 flex-1">
              <Label>Data Final</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button onClick={generateForecast} disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Gerar Previsão
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg">Lista de Compras Projetada</CardTitle>
            {forecast.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo / Item</TableHead>
                  <TableHead className="text-right">Demanda Total</TableHead>
                  <TableHead className="text-right">Estoque Atual</TableHead>
                  <TableHead className="text-right">Comprar (Déficit)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecast.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">
                      {item.needed.toFixed(3)}
                      <div className="text-xs text-muted-foreground">
                        {getUnitHint(item.needed, item.unit)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.stock.toFixed(3)}
                      <div className="text-xs text-muted-foreground">
                        {getUnitHint(item.stock, item.unit)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-600 dark:text-rose-400">
                      {item.toBuy > 0 ? item.toBuy.toFixed(3) : 'OK'}
                      {item.toBuy > 0 && (
                        <div className="text-xs text-rose-600/70">
                          {getUnitHint(item.toBuy, item.unit)}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {forecast.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      Nenhuma demanda encontrada para o período ou estoque 100% abastecido.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
