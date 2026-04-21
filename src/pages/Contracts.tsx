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

  const fetchContracts = async () => {
    setIsLoading(true)
    try {
      const records = await pb.collection('contracts').getFullList({
        sort: '-created',
        expand: 'lead_id',
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

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
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

      <Card className="shadow-sm">
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
                      <Button variant="outline" size="sm" onClick={() => setViewContract(c)}>
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Contract {viewContract?.contract_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-sm py-4">
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 bg-muted/30 p-4 rounded-lg">
              <div>
                <span className="text-muted-foreground block text-xs">Client</span>
                <span className="font-medium text-base">{viewContract?.expand?.lead_id?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Event Date</span>
                <span className="font-medium text-base">
                  {viewContract?.event_date
                    ? new Date(viewContract.event_date).toLocaleDateString('pt-BR')
                    : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Payment Method</span>
                <span className="font-medium">{viewContract?.payment_method || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Installments</span>
                <span className="font-medium">
                  {viewContract?.installments ? `${viewContract.installments}x` : '-'}
                </span>
              </div>
            </div>

            {viewContract?.items_breakdown && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 font-semibold border-b">Financial Breakdown</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewContract.items_breakdown.map((item: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <span
                            className={
                              item.status === 'Discount' || item.status === 'Courtesy'
                                ? 'text-emerald-600 font-medium'
                                : ''
                            }
                          >
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`text-right ${item.value < 0 ? 'text-emerald-600' : ''}`}
                        >
                          {item.value < 0 ? '-' : ''}R$ {Math.abs(item.value || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="bg-muted/50 p-4 flex justify-between items-center border-t">
                  <span className="text-muted-foreground font-medium text-base">
                    Total Approved
                  </span>
                  <span className="font-bold text-xl text-primary">
                    R$ {viewContract?.total_value?.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
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
