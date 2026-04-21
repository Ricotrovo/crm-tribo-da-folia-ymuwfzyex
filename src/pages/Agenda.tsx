import { useState, useEffect, useMemo } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Edit,
  Trash,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { ContractForm } from '@/components/contracts/ContractForm'
import { EditContractSheet } from '@/components/contracts/EditContractSheet'
import { ContractPrintView } from '@/components/contracts/ContractPrintView'

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isContractSheetOpen, setIsContractSheetOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<any>(null)
  const [viewContract, setViewContract] = useState<any>(null)
  const [printPayments, setPrintPayments] = useState<any[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedSalon, setSelectedSalon] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const { toast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadEvents = async () => {
    setLoading(true)
    try {
      let filter = ''

      if (debouncedSearch) {
        filter = `(contract_number ~ '${debouncedSearch}' || lead_id.name ~ '${debouncedSearch}')`
      } else {
        const start = format(startOfMonth(currentDate), 'yyyy-MM-dd 00:00:00')
        const end = format(endOfMonth(currentDate), 'yyyy-MM-dd 23:59:59')
        filter = `event_date >= '${start}' && event_date <= '${end}'`
      }

      if (selectedSalon !== 'all') {
        filter += ` ${filter ? '&&' : ''} salon = '${selectedSalon}'`
      }
      if (selectedStatus !== 'all') {
        filter += ` ${filter ? '&&' : ''} status = '${selectedStatus}'`
      }

      const data = await pb.collection('contracts').getFullList({
        filter,
        sort: 'event_date,event_start_time',
        expand: 'lead_id,menu_id,payments_via_contract_id,birthday_person_id',
      })
      setContracts(data)
    } catch (error) {
      toast({ title: 'Erro ao carregar agenda', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [currentDate, debouncedSearch, selectedSalon, selectedStatus])

  useRealtime('contracts', () => loadEvents())
  useRealtime('payments', () => loadEvents())

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1))

  const handleViewContract = async (c: any) => {
    setViewContract(c)
    try {
      const payments = await pb.collection('payments').getFullList({
        filter: `contract_id = '${c.id}'`,
        sort: 'due_date',
      })
      setPrintPayments(payments)
    } catch (e) {
      setPrintPayments([])
    }
  }

  const handleDeleteContract = async (contract: any) => {
    if (contract.status === 'active' || contract.status === 'finalized') {
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível excluir um contrato ativo ou finalizado.',
        variant: 'destructive',
      })
      return
    }
    if (!confirm('Deseja realmente excluir este contrato permanentemente?')) return
    try {
      await pb.collection('contracts').delete(contract.id)
      toast({ title: 'Sucesso', description: 'Contrato excluído com sucesso.' })
      loadEvents()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao excluir contrato.', variant: 'destructive' })
    }
  }

  const handleCancelContract = async (contract: any) => {
    if (contract.status === 'canceled') return
    if (
      !confirm('Deseja realmente cancelar este contrato? A data será liberada para novas reservas.')
    )
      return
    try {
      await pb.collection('contracts').update(contract.id, { status: 'canceled' })
      const events = await pb
        .collection('events')
        .getFullList({ filter: `contract_id = '${contract.id}'` })
      for (const ev of events) {
        await pb.collection('events').update(ev.id, { status: 'canceled' })
      }
      toast({ title: 'Sucesso', description: 'Contrato cancelado e data liberada.' })
      loadEvents()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao cancelar contrato.', variant: 'destructive' })
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)

  const summary = useMemo(() => {
    return contracts.reduce(
      (acc, c) => {
        const total = c.total_value || 0
        const payments = c.expand?.payments_via_contract_id || []
        const paid = payments
          .filter((p: any) => p.status.toLowerCase() === 'paid')
          .reduce((sum: number, p: any) => sum + p.amount, 0)

        acc.totalValue += total
        acc.totalPaid += paid
        acc.totalDue += Math.max(0, total - paid)
        return acc
      },
      { totalValue: 0, totalPaid: 0, totalDue: 0 },
    )
  }, [contracts])

  const getSalonColor = (salon: string) => {
    if (salon === 'Espaço Premium') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (salon === 'Espaço Kids&Teens') return 'bg-green-100 text-green-800 border-green-200'
    if (salon === 'Prime & KidsTeens' || salon === 'Ambos os Salões')
      return 'bg-purple-100 text-purple-800 border-purple-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Ativo</Badge>
      case 'draft':
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            Rascunho
          </Badge>
        )
      case 'finalized':
        return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Finalizado</Badge>
      case 'canceled':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return (
          <Badge variant="secondary" className="uppercase">
            {status || 'N/A'}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda de Festas</h2>
          <p className="text-muted-foreground">Gerenciamento unificado de agenda e contratos.</p>
        </div>
        <Button onClick={() => setIsContractSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Contrato e Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total Prevista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalPaid)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo a Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(summary.totalDue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-2 w-full xl:w-auto">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-xl font-bold capitalize min-w-[180px] text-center">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto xl:flex-1 justify-end">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contrato/cliente..."
                  className="pl-9 w-full bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedSalon} onValueChange={setSelectedSalon}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white">
                  <SelectValue placeholder="Salão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Salões</SelectItem>
                  <SelectItem value="Espaço Premium">Espaço Premium</SelectItem>
                  <SelectItem value="Espaço Kids&Teens">Espaço Kids&Teens</SelectItem>
                  <SelectItem value="Prime & KidsTeens">Prime & KidsTeens</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[150px] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="finalized">Finalizado</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Contrato</TableHead>
                  <TableHead>Salão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Cardápio</TableHead>
                  <TableHead>Contratante</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Pago</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground h-32">
                      {loading ? 'Carregando agenda...' : 'Nenhum contrato/evento encontrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => {
                    const payments = contract.expand?.payments_via_contract_id || []
                    const paid = payments
                      .filter((p: any) => p.status.toLowerCase() === 'paid')
                      .reduce((sum: number, p: any) => sum + p.amount, 0)
                    const balance = Math.max(0, (contract.total_value || 0) - paid)
                    const isPaidOff = balance <= 0 && contract.total_value > 0

                    return (
                      <TableRow
                        key={contract.id}
                        className={contract.status === 'canceled' ? 'opacity-50 bg-slate-50' : ''}
                      >
                        <TableCell className="font-mono font-medium text-primary">
                          #{contract.contract_number || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSalonColor(contract.salon)}>
                            {contract.salon || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell>
                          {contract.event_date
                            ? format(new Date(contract.event_date), 'dd/MM/yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {contract.event_start_time || 'N/A'} - {contract.event_end_time || 'N/A'}
                        </TableCell>
                        <TableCell
                          className="max-w-[150px] truncate"
                          title={contract.expand?.menu_id?.name}
                        >
                          {contract.expand?.menu_id?.name || 'N/A'}
                        </TableCell>
                        <TableCell
                          className="max-w-[150px] truncate font-medium"
                          title={contract.expand?.lead_id?.name}
                        >
                          {contract.expand?.lead_id?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(contract.total_value || 0)}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">
                          {formatCurrency(paid)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold ${
                            isPaidOff ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {formatCurrency(balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ações</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewContract(contract)}>
                                <FileText className="mr-2 h-4 w-4" /> Visualizar / Imprimir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingContract(contract)}>
                                <Edit className="mr-2 h-4 w-4" /> Alterar Contrato
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleCancelContract(contract)}
                                disabled={contract.status === 'canceled'}
                              >
                                <XCircle className="mr-2 h-4 w-4 text-amber-600" />{' '}
                                <span className="text-amber-600">Cancelar Contrato</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteContract(contract)}
                                disabled={
                                  contract.status === 'active' || contract.status === 'finalized'
                                }
                              >
                                <Trash className="mr-2 h-4 w-4 text-red-500" />{' '}
                                <span className="text-red-500">Excluir Permanente</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Contrato e Evento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ContractForm
              onSuccess={() => {
                setIsContractSheetOpen(false)
                loadEvents()
              }}
              onCancel={() => setIsContractSheetOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {editingContract && (
        <EditContractSheet
          contract={editingContract}
          open={!!editingContract}
          onOpenChange={(o: boolean) => !o && setEditingContract(null)}
          onSuccess={() => {
            setEditingContract(null)
            loadEvents()
          }}
        />
      )}

      {viewContract && (
        <ContractPrintView
          contract={viewContract}
          open={!!viewContract}
          onOpenChange={(o: boolean) => !o && setViewContract(null)}
          payments={printPayments}
        />
      )}
    </div>
  )
}
