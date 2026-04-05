import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { DollarSign, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/export'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const mockFinancialData = [
  { month: 'Jan', receitas: 15000, despesas: 8000 },
  { month: 'Fev', receitas: 18000, despesas: 9000 },
  { month: 'Mar', receitas: 22000, despesas: 11000 },
  { month: 'Abr', receitas: 25000, despesas: 12000 },
  { month: 'Mai', receitas: 28000, despesas: 14000 },
  { month: 'Jun', receitas: 32000, despesas: 15000 },
]

const mockPayables = [
  { desc: 'Fornecedor Salgados', due: '10/06/2026', amount: 1500, status: 'Vencendo' },
  { desc: 'Energia Elétrica', due: '15/06/2026', amount: 800, status: 'A Vencer' },
  { desc: 'Equipe Freelancers', due: '20/06/2026', amount: 3200, status: 'A Vencer' },
]

export function FinancialReport() {
  const handleExport = () => {
    exportToCSV('relatorio-financeiro', mockFinancialData)
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

      <Card>
        <CardHeader>
          <CardTitle>Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              receitas: { label: 'Receitas', color: 'hsl(var(--primary))' },
              despesas: { label: 'Despesas', color: 'hsl(var(--destructive))' },
            }}
            className="h-[350px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockFinancialData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="receitas" fill="var(--color-receitas)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="var(--color-despesas)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contas a Receber (Próximas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <DollarSign className="h-8 w-8 mb-2 opacity-20" />
              <p>Nenhuma conta a receber pendente.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contas a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayables.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.desc}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.due}
                        {item.status === 'Vencendo' && (
                          <Badge variant="destructive" className="text-[10px]">
                            Vencendo
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">R$ {item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
