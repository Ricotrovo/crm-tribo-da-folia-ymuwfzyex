import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from 'recharts'
import { Calendar, DollarSign, Percent, Download, Package } from 'lucide-react'
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

const mockMenuData = [
  { name: 'Kids & Teens', value: 45, fill: 'hsl(var(--primary))' },
  { name: 'Premium', value: 30, fill: 'hsl(var(--secondary))' },
  { name: 'Escolar', value: 15, fill: 'hsl(var(--accent))' },
  { name: 'Brunch', value: 10, fill: 'hsl(var(--muted))' },
]

const mockEventsTable = [
  { date: '15/05/2026', client: 'Ana Silva', menu: 'Premium', revenue: 5500, margin: '55%' },
  {
    date: '18/05/2026',
    client: 'Carlos Souza',
    menu: 'Kids & Teens',
    revenue: 4200,
    margin: '52%',
  },
  { date: '22/05/2026', client: 'Juliana Costa', menu: 'Escolar', revenue: 3800, margin: '48%' },
]

export function EventsReport() {
  const handleExport = () => {
    exportToCSV('relatorio-eventos', mockEventsTable)
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Realizados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 185.000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.850</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">53%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Cardápio</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockMenuData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {mockMenuData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Últimos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Cardápio</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEventsTable.map((event, i) => (
                  <TableRow key={i}>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.client}</TableCell>
                    <TableCell>{event.menu}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium">
                      R$ {event.revenue}
                    </TableCell>
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
