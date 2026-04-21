import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Download, FileText, Edit, XCircle, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { exportContractToPDF, updateContract } from '@/services/contracts'
import { toast } from 'sonner'
import { EditContractSheet } from './EditContractSheet'
import { useState } from 'react'
import pb from '@/lib/pocketbase/client'

export function ContractList({ contracts, isLoading }: { contracts: any[]; isLoading: boolean }) {
  const [editingContract, setEditingContract] = useState<any>(null)

  const handleCancelContract = async (contract: any) => {
    if (!confirm('Deseja realmente cancelar este contrato? A data será liberada na agenda.')) return
    try {
      await updateContract(contract.id, { status: 'canceled' })
      const events = await pb
        .collection('events')
        .getFullList({ filter: `contract_id = '${contract.id}'` })
      for (const ev of events) {
        await pb.collection('events').update(ev.id, { status: 'canceled' })
      }
      toast.success('Contrato cancelado com sucesso.')
      window.location.reload()
    } catch (e) {
      toast.error('Erro ao cancelar contrato.')
    }
  }

  const handleDelete = async (contract: any) => {
    if (!confirm('Deseja realmente excluir este contrato?')) return
    try {
      await pb.collection('contracts').delete(contract.id)
      toast.success('Contrato excluído com sucesso.')
      window.location.reload()
    } catch (e) {
      toast.error('Erro ao excluir contrato.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500 hover:bg-emerald-600'
      case 'Signed':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'Draft':
        return 'bg-amber-500 hover:bg-amber-600'
      case 'Cancelled':
        return 'bg-rose-500 hover:bg-rose-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const parts = dateStr.split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
    return dateStr
  }

  const handleExport = async (contract: any) => {
    toast.info(`Generating PDF for contract #${contract.contract_number}...`)
    try {
      await exportContractToPDF(contract)
      toast.success('PDF generated and ready for download')
    } catch {
      toast.error('Failed to generate PDF')
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading contracts...
      </div>
    )
  }

  if (contracts.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <FileText className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium">No contracts found</h3>
        <p className="text-muted-foreground mt-2">Create a new contract to get started.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Event Date</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium text-primary">
                #{contract.contract_number}
              </TableCell>
              <TableCell>{contract.clients?.name}</TableCell>
              <TableCell>{formatDate(contract.events?.date)}</TableCell>
              <TableCell>R$ {contract.total_value?.toLocaleString()}</TableCell>
              <TableCell>
                <Badge
                  className={`${getStatusColor(contract.status)} text-white border-transparent uppercase`}
                >
                  {contract.status || 'DRAFT'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setEditingContract(contract)}>
                      <Edit className="mr-2 h-4 w-4" /> Alterar Contrato
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(contract)}>
                      <Download className="mr-2 h-4 w-4" /> Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleCancelContract(contract)}
                      disabled={contract.status === 'canceled'}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Cancelar Contrato
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(contract)}
                      disabled={contract.status !== 'draft'}
                    >
                      <Trash className="mr-2 h-4 w-4 text-red-500" />{' '}
                      <span className="text-red-500">Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingContract && (
        <EditContractSheet
          contract={editingContract}
          open={!!editingContract}
          onOpenChange={(o: boolean) => !o && setEditingContract(null)}
          onSuccess={() => {
            setEditingContract(null)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
