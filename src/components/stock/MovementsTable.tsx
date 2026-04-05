import { useEffect, useState } from 'react'
import { getMovements } from '@/services/stock'
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
import { format } from 'date-fns'

export function MovementsTable({ refreshKey }: { refreshKey: number }) {
  const [movements, setMovements] = useState<any[]>([])

  useEffect(() => {
    getMovements().then(setMovements)
  }, [refreshKey])

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Origem/Destino</TableHead>
              <TableHead>Lote/Evento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{format(new Date(m.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                <TableCell>
                  {m.type === 'entry' && <Badge className="bg-emerald-500">Entrada</Badge>}
                  {m.type === 'exit' && <Badge variant="destructive">Saída</Badge>}
                  {m.type === 'transfer' && <Badge variant="secondary">Transf.</Badge>}
                </TableCell>
                <TableCell>{m.product?.name}</TableCell>
                <TableCell>
                  {m.quantity} {m.product?.unit}
                </TableCell>
                <TableCell className="capitalize">
                  {m.type === 'entry'
                    ? m.location_to
                    : m.type === 'exit'
                      ? m.location_from
                      : `${m.location_from} → ${m.location_to}`}
                </TableCell>
                <TableCell>
                  {m.lot && (
                    <span className="text-muted-foreground text-sm block">Lote: {m.lot}</span>
                  )}
                  {m.event && (
                    <span className="text-muted-foreground text-sm block">Ev: {m.event.title}</span>
                  )}
                  {!m.lot && !m.event && <span className="text-muted-foreground text-sm">-</span>}
                </TableCell>
              </TableRow>
            ))}
            {movements.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhuma movimentação registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
