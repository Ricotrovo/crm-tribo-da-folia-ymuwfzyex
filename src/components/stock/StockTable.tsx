import { useEffect, useState } from 'react'
import { getInventory } from '@/services/stock'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Check, AlertCircle } from 'lucide-react'

export function StockTable({ refreshKey }: { refreshKey: number }) {
  const [inventory, setInventory] = useState<any[]>([])

  useEffect(() => {
    getInventory().then(setInventory)
  }, [refreshKey])

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Localização</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((p) => {
              const ratio = p.quantity / p.min_quantity
              const isDanger = ratio < 1
              const isWarning = ratio >= 1 && ratio < 1.2
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="font-mono">
                    {p.quantity} {p.unit}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.min_quantity}</TableCell>
                  <TableCell>
                    {isDanger ? (
                      <Badge variant="destructive" className="flex w-fit items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Crítico
                      </Badge>
                    ) : isWarning ? (
                      <Badge
                        variant="secondary"
                        className="flex w-fit items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200"
                      >
                        <AlertCircle className="h-3 w-3" /> Baixo
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex w-fit items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200"
                      >
                        <Check className="h-3 w-3" /> OK
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-muted-foreground">
                      {p.locations.map((l: any) => (
                        <span key={l.location} className="capitalize">
                          {l.location}: {l.quantity}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
