import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ContractForm } from '@/components/contracts/ContractForm'

export default function Contracts() {
  const [contracts, setContracts] = useState<any[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [viewContract, setViewContract] = useState<any>(null)
  const [contractPayments, setContractPayments] = useState<any[]>([])

  const fetchContracts = async () => {
    setIsLoading(true)
    try {
      const records = await pb.collection('contracts').getFullList({
        sort: '-created',
        expand: 'lead_id,birthday_person_id',
      })
      setContracts(records || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  useRealtime('contracts', fetchContracts)

  const handleViewContract = async (c: any) => {
    setViewContract(c)
    try {
      const payments = await pb.collection('payments').getFullList({
        filter: `contract_id = '${c.id}'`,
        sort: 'due_date',
      })
      setContractPayments(payments)
    } catch (e) {
      console.error(e)
      setContractPayments([])
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: fixed !important;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            overflow: visible;
            padding: 1cm;
            margin: 0;
            z-index: 999999;
            background: white;
            color: black;
          }
          .print-hide {
             display: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row justify-between gap-4 print-hide">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contracts</h2>
          <p className="text-muted-foreground mt-1">
            Manage event contracts and financial breakdowns.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button onClick={() => setIsSheetOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> New Contract
          </Button>
        </div>
      </div>

      <Card className="shadow-sm print-hide">
        <CardHeader className="pb-3 border-b">
          <CardTitle>All Contracts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No contracts found.
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">
                      {c.contract_number || c.id.split('-')[0]}
                    </TableCell>
                    <TableCell className="font-medium">
                      {c.expand?.lead_id?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {c.event_date ? new Date(c.event_date).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600">
                      R$ {c.total_value?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewContract(c)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Contract</DialogTitle>
          </DialogHeader>
          <ContractForm
            onSuccess={() => setIsSheetOpen(false)}
            onCancel={() => setIsSheetOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewContract} onOpenChange={(open) => !open && setViewContract(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
          <div id="print-area" className="p-6 bg-white text-black space-y-6 text-sm">
            <div className="text-center border-b pb-4 border-slate-300">
              <h1 className="text-2xl font-bold uppercase tracking-wider">
                Tribo da Folia - Contrato
              </h1>
              <p className="text-muted-foreground mt-1 text-xs">
                CNPJ: 00.000.000/0001-00 | Av. Principal, 100 - Centro
              </p>
              <p className="font-mono text-xs mt-2">Contrato Nº {viewContract?.contract_number}</p>
            </div>

            <div className="space-y-2">
              <h2 className="font-bold text-base uppercase bg-muted/50 p-1 border-l-4 border-primary">
                1. Contratante e Aniversariante
              </h2>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="font-semibold text-muted-foreground">Contratante:</span>{' '}
                  {viewContract?.expand?.lead_id?.name}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">CPF/RG:</span>{' '}
                  {viewContract?.expand?.lead_id?.cpf || viewContract?.expand?.lead_id?.rg || '-'}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Telefone:</span>{' '}
                  {viewContract?.expand?.lead_id?.phone || '-'}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Email:</span>{' '}
                  {viewContract?.expand?.lead_id?.email || '-'}
                </div>
                {viewContract?.expand?.birthday_person_id && (
                  <div className="col-span-2 mt-2 pt-2 border-t">
                    <span className="font-semibold text-muted-foreground">Aniversariante:</span>{' '}
                    {viewContract.expand.birthday_person_id.name}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-bold text-base uppercase bg-muted/50 p-1 border-l-4 border-primary">
                2. Dados do Evento
              </h2>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="font-semibold text-muted-foreground">Data:</span>{' '}
                  {viewContract?.event_date
                    ? new Date(viewContract.event_date).toLocaleDateString('pt-BR')
                    : '-'}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Convidados:</span>{' '}
                  {viewContract?.guests || '-'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-bold text-base uppercase bg-muted/50 p-1 border-l-4 border-primary">
                3. Observações e Detalhes
              </h2>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="font-semibold text-muted-foreground">Tema da Festa:</span>{' '}
                  {viewContract?.theme_notes || '-'}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Bolo (Sabor/Detalhes):
                  </span>{' '}
                  {viewContract?.cake_notes || '-'}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Observações de Pagamento:
                  </span>{' '}
                  {viewContract?.payment_notes || '-'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-bold text-base uppercase bg-muted/50 p-1 border-l-4 border-primary">
                4. Resumo Financeiro e Parcelas
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <span className="font-semibold text-muted-foreground">Valor Total:</span>{' '}
                  <span className="font-bold text-emerald-700">
                    R$ {viewContract?.total_value?.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Forma de Pagamento:</span>{' '}
                  {viewContract?.payment_method}
                </div>
                {viewContract?.payment_day && (
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Dia de Vencimento Fixo:
                    </span>{' '}
                    {viewContract.payment_day}
                  </div>
                )}
              </div>

              {contractPayments && contractPayments.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="py-1 h-8">Parcela</TableHead>
                        <TableHead className="py-1 h-8">Vencimento</TableHead>
                        <TableHead className="py-1 h-8 text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contractPayments.map((p: any, i: number) => (
                        <TableRow key={p.id}>
                          <TableCell className="py-1 h-8">{i + 1}</TableCell>
                          <TableCell className="py-1 h-8">
                            {new Date(p.due_date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="py-1 h-8 text-right font-medium">
                            R$ {p.amount?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="space-y-2 mt-8 text-xs text-slate-600">
              <h2 className="font-bold text-sm uppercase bg-muted/50 p-1 border-l-4 border-primary">
                5. Cláusulas Padrão
              </h2>
              <p>
                1. O cancelamento deve ser notificado com no mínimo 30 dias de antecedência, sujeito
                a multa de 20% do valor total do contrato.
              </p>
              <p>
                2. O número de convidados excedente será cobrado no dia do evento, conforme tabela
                vigente.
              </p>
              <p>
                3. O contratante cede os direitos de imagem do evento para uso em portfólio da
                empresa, salvo manifestação contrária por escrito.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-16 pt-8 text-center text-sm font-medium">
              <div>
                <div className="border-t border-black mb-2 mx-8"></div>
                <p>Contratante</p>
              </div>
              <div>
                <div className="border-t border-black mb-2 mx-8"></div>
                <p>Tribo da Folia</p>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 border-t print-hide bg-slate-50">
            <Button variant="outline" onClick={() => window.print()}>
              Print Contract
            </Button>
            <Button onClick={() => setViewContract(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
