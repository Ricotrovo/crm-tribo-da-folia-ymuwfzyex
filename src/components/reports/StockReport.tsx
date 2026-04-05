import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package, AlertTriangle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { exportToCSV } from '@/lib/export'

const mockStock = [
  { product: 'Coxinha de Frango', qty: 150, min: 500, status: 'Crítico' },
  { product: 'Refrigerante Cola 2L', qty: 12, min: 20, status: 'Baixo' },
  { product: 'Bolinha de Queijo', qty: 800, min: 500, status: 'OK' },
  { product: 'Copos Descartáveis', qty: 50, min: 200, status: 'Crítico' },
]

export function StockReport() {
  const handleExport = () => {
    exportToCSV('relatorio-estoque', mockStock)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Estimado em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 8.450,00</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos com Estoque Baixo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd. Atual</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStock
                .filter((s) => s.status !== 'OK')
                .map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{item.min}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Crítico' ? 'destructive' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
