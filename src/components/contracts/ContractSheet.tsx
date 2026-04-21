import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ContractForm } from './ContractForm'

interface ContractSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ContractSheet({ open, onOpenChange, onSuccess }: ContractSheetProps) {
  const handleSuccess = (contractId?: string) => {
    onSuccess()
    if (contractId) {
      window.open(`/contracts/${contractId}/print`, '_blank')
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Create New Contract</SheetTitle>
          <SheetDescription>
            Fill out the details to generate a sequential contract and calculate installments.
          </SheetDescription>
        </SheetHeader>
        <ContractForm onSuccess={handleSuccess} onCancel={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
