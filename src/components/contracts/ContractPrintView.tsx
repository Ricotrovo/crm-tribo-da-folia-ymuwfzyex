import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ContractPrintView({ contract, open, onOpenChange, payments }: any) {
  if (!contract) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
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

        <div id="print-area" className="p-6 bg-white text-black space-y-6 text-sm">
          <div className="text-center border-b pb-4 border-slate-300">
            <h1 className="text-2xl font-bold uppercase tracking-wider">
              Tribo da Folia - Contrato
            </h1>
            <p className="text-muted-foreground mt-1 text-xs">
              CNPJ: 00.000.000/0001-00 | Av. Principal, 100 - Centro
            </p>
            <p className="font-mono text-xs mt-2">Contrato Nº {contract?.contract_number}</p>
          </div>

          <div className="space-y-2">
            <h2 className="font-bold text-base uppercase bg-muted/50 p-1 border-l-4 border-primary">
              1. Contratante e Aniversariante
            </h2>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <span className="font-semibold text-muted-foreground">Contratante:</span>{' '}
                {contract?.expand?.lead_id?.name}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">CPF/RG:</span>{' '}
                {contract?.expand?.lead_id?.cpf || contract?.expand?.lead_id?.rg || '-'}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Telefone:</span>{' '}
                {contract?.expand?.lead_id?.phone || '-'}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Email:</span>{' '}
                {contract?.expand?.lead_id?.email || '-'}
              </div>
              {contract?.expand?.birthday_person_id && (
                <div className="col-span-2 mt-2 pt-2 border-t">
                  <span className="font-semibold text-muted-foreground">Aniversariante:</span>{' '}
                  {contract.expand.birthday_person_id.name}
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
                {contract?.event_date
                  ? new Date(contract.event_date).toLocaleDateString('pt-BR')
                  : '-'}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Convidados:</span>{' '}
                {contract?.guest_count || contract?.guests || '-'}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Horário:</span>{' '}
                {contract?.event_start_time || '-'} às {contract?.event_end_time || '-'}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Salão:</span>{' '}
                {contract?.salon || '-'}
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
                {contract?.theme_notes || contract?.notes || '-'}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Bolo (Sabor/Detalhes):</span>{' '}
                {contract?.cake_notes || '-'}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">
                  Observações de Pagamento:
                </span>{' '}
                {contract?.payment_notes || '-'}
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
                  R$ {contract?.total_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Forma de Pagamento:</span>{' '}
                {contract?.payment_method}
              </div>
              {contract?.payment_day && (
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Dia de Vencimento Fixo:
                  </span>{' '}
                  {contract.payment_day}
                </div>
              )}
            </div>

            {payments && payments.length > 0 && (
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
                    {payments.map((p: any, i: number) => (
                      <TableRow key={p.id}>
                        <TableCell className="py-1 h-8">{i + 1}</TableCell>
                        <TableCell className="py-1 h-8">
                          {new Date(p.due_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="py-1 h-8 text-right font-medium">
                          R$ {p.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              1. O cancelamento deve ser notificado com no mínimo 30 dias de antecedência, sujeito a
              multa de 20% do valor total do contrato.
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
            Imprimir Contrato
          </Button>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
