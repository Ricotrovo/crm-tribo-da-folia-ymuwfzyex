import { useState, useEffect } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { ContractForm } from '@/components/contracts/ContractForm'

interface ContractEvent {
  id: string
  contract_number: string
  salon: string
  event_date: string
  event_start_time: string
  total_value: number
  expand?: {
    lead_id?: { name: string }
    menu_id?: { name: string }
    payments_via_contract_id?: Array<{ amount: number; status: string }>
  }
}

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [contracts, setContracts] = useState<ContractEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [isContractSheetOpen, setIsContractSheetOpen] = useState(false)
  const { toast } = useToast()

  const loadEvents = async (date: Date) => {
    setLoading(true)
    try {
      const start = format(startOfMonth(date), 'yyyy-MM-dd 00:00:00')
      const end = format(endOfMonth(date), 'yyyy-MM-dd 23:59:59')

      const data = await pb.collection('contracts').getFullList({
        filter: `event_date >= '${start}' && event_date <= '${end}'`,
        sort: 'event_date,event_start_time',
        expand: 'lead_id,menu_id,payments_via_contract_id',
      })
      setContracts(data as unknown as ContractEvent[])
    } catch (error) {
      toast({ title: 'Erro ao carregar agenda', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents(currentDate)
  }, [currentDate])

  useRealtime('contracts', () => loadEvents(currentDate))
  useRealtime('payments', () => loadEvents(currentDate))

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1))

  const getSalonColor = (salon: string) => {
    if (salon === 'Espaço Premium') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (salon === 'Espaço Kids&Teens') return 'bg-green-100 text-green-800 border-green-200'
    if (salon === 'Ambos os Salões') return 'bg-purple-100 text-purple-800 border-purple-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const calculatePaid = (payments: Array<{ amount: number; status: string }> = []) => {
    return payments
      .filter((p) => p.status.toLowerCase() === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda de Festas</h2>
          <p className="text-muted-foreground">Visão geral de eventos e contratos.</p>
        </div>
        <Button onClick={() => setIsContractSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número do contrato</TableHead>
                  <TableHead>Salão Escolhido</TableHead>
                  <TableHead>Data do evento</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Cardápio</TableHead>
                  <TableHead>Contratante</TableHead>
                  <TableHead className="text-right">Valor do Evento</TableHead>
                  <TableHead className="text-right">Valor Pago</TableHead>
                  <TableHead className="text-right">Saldo Devedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground h-32">
                      {loading ? 'Carregando agenda...' : 'Nenhum evento agendado para este mês.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => {
                    const paid = calculatePaid(contract.expand?.payments_via_contract_id)
                    const balance = contract.total_value - paid
                    const isPaidOff = balance <= 0

                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">
                          {contract.contract_number || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSalonColor(contract.salon)}>
                            {contract.salon || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {contract.event_date
                            ? format(new Date(contract.event_date), 'dd/MM/yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{contract.event_start_time || 'N/A'}</TableCell>
                        <TableCell>{contract.expand?.menu_id?.name || 'N/A'}</TableCell>
                        <TableCell>{contract.expand?.lead_id?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(contract.total_value || 0)}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">
                          {formatCurrency(paid)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold ${
                            isPaidOff ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(balance)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isContractSheetOpen} onOpenChange={setIsContractSheetOpen}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Contrato e Evento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ContractForm
              onSuccess={() => {
                setIsContractSheetOpen(false)
                loadEvents(currentDate)
              }}
              onCancel={() => setIsContractSheetOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
