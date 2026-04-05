import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Star, DollarSign, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { exportToCSV } from '@/lib/export'

const mockFreelancers = [
  { name: 'João Silva', role: 'Garçom', score: 98, events: 15, cost: 2250 },
  { name: 'Maria Santos', role: 'Monitora', score: 95, events: 12, cost: 1440 },
  { name: 'Pedro Costa', role: 'Garçom', score: 88, events: 10, cost: 1500 },
  { name: 'Ana Oliveira', role: 'Copeira', score: 92, events: 14, cost: 1960 },
]

export function FreelancersReport() {
  const handleExport = () => {
    exportToCSV('relatorio-freelancers', mockFreelancers)
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
            <CardTitle className="text-sm font-medium">Freelancers Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 7.150,00</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Freelancers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo Principal</TableHead>
                <TableHead>Eventos</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Custo Gerado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFreelancers.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>{item.events}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3 w-3 fill-current" /> {item.score}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">R$ {item.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
