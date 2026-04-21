import { useEffect, useState } from 'react'
import { format, isBefore, addDays } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Plus, Receipt } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { CostBreakdown } from './CostBreakdown'
import { RegisterPaymentDialog } from './RegisterPaymentDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ContractDetailsSheet({
  contractId,
  open,
  onOpenChange,
}: {
  contractId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [contract, setContract] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  const loadData = async () => {
    if (!contractId) return
    setLoading(true)
    try {
      const c = await pb.collection('contracts').getOne(contractId, { expand: 'client_id,lead_id' })
      setContract(c)
      const p = await pb.collection('payments').getFullList({
        filter: `contract_id = '${contractId}'`,
        sort: 'due_date',
        expand: 'recorded_by',
      })
      setPayments(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && contractId) loadData()
  }, [open, contractId])

  useRealtime('payments', (e) => {
    if (e.record.contract_id === contractId) {
      loadData()
    }
  })

  useRealtime('contracts', (e) => {
    if (e.record.id === contractId) {
      loadData()
    }
  })

  if (!contract && open) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <div className="flex items-center justify-center h-full">Carregando...</div>
        </SheetContent>
      </Sheet>
    )
  }

  if (!contract) return null

  const totalPaid = payments
    .filter((p) => p.status === 'paid' || p.status === 'Pago')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const balance = (contract.total_value || 0) - totalPaid
  const eventDate = new Date(contract.event_date)
  const nearingEvent = isBefore(eventDate, addDays(new Date(), 15)) && balance > 0
  const isFinalized = contract.status === 'finalized' || contract.status === 'canceled'
  const isGerente = pb.authStore.record?.role?.toLowerCase() === 'gerente'

  const breakdownData = contract.items_breakdown || {}

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6 mt-4">
            <div className="flex justify-between items-start">
              <div>
                <SheetTitle className="text-2xl">Contrato {contract.contract_number}</SheetTitle>
                <SheetDescription>
                  {contract.expand?.lead_id?.name || contract.expand?.client_id?.name}
                </SheetDescription>
              </div>
              <Badge variant={balance > 0 ? 'destructive' : 'default'} className="ml-4">
                {contract.status}
              </Badge>
            </div>
          </SheetHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="general">Informações Gerais</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Data do Evento</h4>
                  <p>
                    {contract.event_date
                      ? format(new Date(contract.event_date), 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Horário</h4>
                  <p>
                    {contract.event_start_time} - {contract.event_end_time}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Salão</h4>
                  <p>{contract.salon}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Convidados</h4>
                  <p>{contract.guest_count}</p>
                </div>
              </div>

              <CostBreakdown
                baseValue={breakdownData.baseValue || 0}
                discount={breakdownData.discount || 0}
                extraGuestsValue={breakdownData.extraGuestsValue || 0}
                photoVal={breakdownData.photoVal || 0}
                decoVal={breakdownData.decoVal || 0}
                totalValue={contract.total_value}
                values={{
                  duration: contract.duration,
                  photographer: breakdownData.photographer,
                  photographer_courtesy: breakdownData.photographer_courtesy,
                  extra_decoration: breakdownData.extra_decoration,
                  extra_decoration_courtesy: breakdownData.extra_decoration_courtesy,
                }}
              />
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              {nearingEvent && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-medium">Atenção: Saldo Devedor Próximo ao Evento</h5>
                    <p className="text-sm opacity-90">
                      O evento ocorrerá em breve e ainda há saldo devedor de R$ {balance.toFixed(2)}
                      .
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      Valor Total
                    </p>
                    <p className="text-2xl font-bold">
                      R$ {(contract.total_value || 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      Total Pago
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">R$ {totalPaid.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className={balance > 0 ? 'border-destructive/50' : ''}>
                  <CardContent className="p-4 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      Saldo Devedor
                    </p>
                    <p
                      className={`text-2xl font-bold ${balance > 0 ? 'text-destructive' : 'text-emerald-600'}`}
                    >
                      R$ {balance.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-muted-foreground" />
                    Parcelas e Pagamentos
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isFinalized}
                    onClick={() => {
                      setSelectedPayment(null)
                      setPaymentDialogOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Novo
                  </Button>
                </div>

                <div className="border rounded-md overflow-hidden bg-card">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Data / Venc</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registrado Por</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                            Nenhuma parcela registrada.
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium text-sm">
                              {p.due_date ? format(new Date(p.due_date), 'dd/MM/yyyy') : '-'}
                            </TableCell>
                            <TableCell className="font-medium">
                              R$ {(p.amount || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {p.payment_method || 'Não definido'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  p.status === 'paid' || p.status === 'Pago'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className={
                                  p.status === 'paid' || p.status === 'Pago'
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : ''
                                }
                              >
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {p.expand?.recorded_by?.name || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {isGerente && !isFinalized && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPayment(p)
                                    setPaymentDialogOpen(true)
                                  }}
                                >
                                  Editar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {paymentDialogOpen && (
        <RegisterPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          contractId={contract.id}
          payment={selectedPayment}
          onSuccess={() => {
            loadData()
            setPaymentDialogOpen(false)
          }}
        />
      )}
    </>
  )
}
