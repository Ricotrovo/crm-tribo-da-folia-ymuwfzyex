import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ContractList } from '@/components/contracts/ContractList'
import { ContractSheet } from '@/components/contracts/ContractSheet'
import { supabase } from '@/lib/supabase/client'

export default function Contracts() {
  const [contracts, setContracts] = useState<any[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchContracts = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('contracts')
      .select('*, clients(name), events(title, date)')
      .order('created_at', { ascending: false })

    setContracts(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contracts</h2>
          <p className="text-muted-foreground mt-1">
            Manage event contracts, values, and payment installments.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button onClick={() => setIsSheetOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Create Contract
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Contracts</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by # or Client name..." className="pl-8 bg-muted/50" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ContractList contracts={contracts} isLoading={isLoading} />
        </CardContent>
      </Card>

      <ContractSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSuccess={() => {
          setIsSheetOpen(false)
          fetchContracts()
        }}
      />
    </div>
  )
}
