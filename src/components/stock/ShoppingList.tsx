import { useEffect, useState } from 'react'
import { getInventory, getUpcomingEvents } from '@/services/stock'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

const REQUIREMENTS_PER_GUEST: Record<string, number> = {
  Coxinha: 10,
  'Bolinha de Queijo': 10,
  'Refrigerante Cola': 0.5,
  Nhoque: 0.1,
}

export function ShoppingList({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const inventory = await getInventory()
      const events = await getUpcomingEvents()

      const totalGuests = events.reduce((acc: number, ev: any) => acc + (ev.guests || 0), 0)

      const list = inventory
        .map((product: any) => {
          const neededPerGuest = REQUIREMENTS_PER_GUEST[product.name] || 0
          const totalNeeded = neededPerGuest * totalGuests
          const deficitByEvents = totalNeeded - product.quantity
          const deficitByMin = product.min_quantity - product.quantity
          const deficit = Math.max(deficitByEvents, deficitByMin, 0)
          return {
            ...product,
            needed: totalNeeded,
            deficit,
          }
        })
        .filter((p: any) => p.deficit > 0)
      setItems(list)
    }
    load()
  }, [refreshKey])

  const exportCSV = () => {
    const csv = [
      ['Produto', 'Categoria', 'Estoque Atual', 'Necessario', 'Deficit (Comprar)'],
      ...items.map((i) => [i.name, i.category, i.quantity, i.needed, i.deficit]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lista_compras.csv'
    a.click()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Previsão para 7 Dias e Reposição Mínima</CardTitle>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estoque Atual</TableHead>
              <TableHead>Demanda (7 dias)</TableHead>
              <TableHead>Déficit (Comprar)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell>{i.category}</TableCell>
                <TableCell>
                  {i.quantity} {i.unit}
                </TableCell>
                <TableCell>
                  {i.needed} {i.unit}
                </TableCell>
                <TableCell className="font-bold text-rose-600 dark:text-rose-400">
                  {i.deficit} {i.unit}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma reposição necessária no momento.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
