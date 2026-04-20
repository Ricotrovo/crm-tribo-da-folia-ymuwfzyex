import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { getLead, updateLead, deleteLead, Lead } from '@/services/leads'
import { useToast } from '@/hooks/use-toast'
import { LeadTabContato } from './LeadTabContato'
import { LeadTabFamilia } from './LeadTabFamilia'
import { LeadTabContratos } from './LeadTabContratos'
import { LeadTabDocumentacao } from './LeadTabDocumentacao'
import { LeadInteractions } from './LeadInteractions'
import { validateCPF } from '@/lib/formatters'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useRealtime } from '@/hooks/use-realtime'

export function LeadDetails({
  leadId,
  open,
  onOpenChange,
}: {
  leadId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [lead, setLead] = useState<Partial<Lead> | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const loadLead = async () => {
    if (!leadId) return
    try {
      const data = await getLead(leadId)
      setLead(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (open) loadLead()
  }, [leadId, open])

  useRealtime('leads', (e) => {
    if (e.record.id === leadId) {
      if (e.action === 'delete') {
        onOpenChange(false)
      } else {
        loadLead()
      }
    }
  })

  const handleSave = async () => {
    if (!lead) return
    if (lead.cpf && lead.cpf.length === 14 && !validateCPF(lead.cpf)) {
      return toast({
        title: 'Atenção',
        description: 'O CPF informado é inválido. Corrija antes de salvar.',
        variant: 'destructive',
      })
    }
    setLoading(true)
    try {
      await updateLead(leadId, lead)
      toast({ title: 'Sucesso', description: 'Lead atualizado com sucesso.' })
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao salvar lead.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteLead(leadId)
      toast({ title: 'Sucesso', description: 'Lead excluído com sucesso.' })
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao excluir lead.',
        variant: 'destructive',
      })
    }
  }

  if (!lead) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-start pr-8">
            <div className="flex flex-col gap-1 text-left">
              <SheetTitle className="text-xl font-bold">{lead.name}</SheetTitle>
              <SheetDescription>Detalhes e histórico do lead.</SheetDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Lead?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os dados e interações serão perdidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetHeader>

        <Tabs defaultValue="contato" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="contato">Contato</TabsTrigger>
            <TabsTrigger value="familia">Evento/Família</TabsTrigger>
            <TabsTrigger value="documentacao">Documentação</TabsTrigger>
            <TabsTrigger value="contratos">Contratual</TabsTrigger>
            <TabsTrigger value="interacoes">Histórico</TabsTrigger>
          </TabsList>

          <div className="mt-4 pb-20">
            <TabsContent value="contato" className="animate-fade-in">
              <LeadTabContato lead={lead} onChange={setLead} />
            </TabsContent>
            <TabsContent value="familia" className="animate-fade-in">
              <LeadTabFamilia lead={lead} onChange={setLead} leadId={leadId} />
            </TabsContent>
            <TabsContent value="documentacao" className="animate-fade-in">
              <LeadTabDocumentacao lead={lead} onChange={setLead} />
            </TabsContent>
            <TabsContent value="contratos" className="animate-fade-in">
              <LeadTabContratos lead={lead} onChange={setLead} />
            </TabsContent>
            <TabsContent value="interacoes" className="animate-fade-in">
              <LeadInteractions leadId={leadId} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="absolute bottom-0 right-0 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t w-full flex justify-end z-10">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
