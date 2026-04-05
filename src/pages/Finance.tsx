import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download, TrendingUp, TrendingDown, DollarSign, PlusCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { format, isPast, isToday } from 'date-fns'

export default function Finance() {
  const [receivables, setReceivables] = useState<any[]>([])
  const [payables, setPayables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: payData } = await supabase
        .from('payments')
        .select('*')
        .order('due_date', { ascending: true })

      const { data: expData } = await supabase
        .from('expenses' as any)
        .select('*')
        .order('due_date', { ascending: true })

      setReceivables(payData || [])
      setPayables(expData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const totalReceivables = receivables.reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalPayables = payables.reduce((acc, curr) => acc + Number(curr.amount), 0)
  const pendingReceivables = receivables
    .filter((r) => r.status === 'Pendente')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground">
            Gestão de contas a pagar, receber e fluxo de caixa.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Relatório
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Despesa
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-emerald-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalReceivables)}</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" /> {formatCurrency(pendingReceivables)} pendentes
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-rose-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayables)}</div>
            <p className="text-xs text-rose-500 flex items-center mt-1">
              Despesas e custos operacionais
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Previsto</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalReceivables - totalPayables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lucro bruto projetado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receivables" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="receivables"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Contas a Receber
          </TabsTrigger>
          <TabsTrigger
            value="payables"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Contas a Pagar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="receivables" className="pt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : receivables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhuma conta a receber.
                    </TableCell>
                  </TableRow>
                ) : (
                  receivables.map((payment) => {
                    const isOverdue =
                      payment.status === 'Pendente' &&
                      isPast(new Date(payment.due_date)) &&
                      !isToday(new Date(payment.due_date))
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className={isOverdue ? 'text-rose-500 font-medium' : ''}>
                          {format(new Date(payment.due_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{payment.installment_number}ª Parcela</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === 'Pago'
                                ? 'default'
                                : isOverdue
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {payment.status === 'Pago'
                              ? 'Pago'
                              : isOverdue
                                ? 'Atrasado'
                                : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.status === 'Pendente' && (
                            <Button size="sm" variant="outline" className="h-8">
                              Receber
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="payables" className="pt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : payables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhuma conta a pagar.
                    </TableCell>
                  </TableRow>
                ) : (
                  payables.map((expense) => {
                    const isOverdue =
                      expense.status === 'Pendente' &&
                      isPast(new Date(expense.due_date)) &&
                      !isToday(new Date(expense.due_date))
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className={isOverdue ? 'text-rose-500 font-medium' : ''}>
                          {format(new Date(expense.due_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-xs text-muted-foreground">{expense.supplier}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              expense.status === 'Pago'
                                ? 'default'
                                : isOverdue
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {expense.status === 'Pago'
                              ? 'Pago'
                              : isOverdue
                                ? 'Atrasado'
                                : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {expense.status === 'Pendente' && (
                            <Button size="sm" variant="outline" className="h-8">
                              Pagar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
