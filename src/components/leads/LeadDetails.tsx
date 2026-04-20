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
import { getLead, updateLead, deleteLead, Lead, getLeadByPhone } from '@/services/leads'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { LeadTabContato } from './LeadTabContato'
import { LeadTabFamilia } from './LeadTabFamilia'
import { LeadTabContratos } from './LeadTabContratos'
import { LeadTabDocumentacao } from './LeadTabDocumentacao'
import { LeadInteractions } from './LeadInteractions'
import { validateCPF, maskCPF, maskPhone, maskRG, maskCEP } from '@/lib/formatters'
import { Trash2, MessageCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { getUsers, User } from '@/services/users'
import { Badge } from '@/components/ui/badge'
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [users, setUsers] = useState<User[]>([])
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error)
  }, [])

  const loadLead = async () => {
    if (!leadId) return
    try {
      const data = await getLead(leadId)
      setLead({
        ...data,
        cpf: data.cpf ? maskCPF(String(data.cpf)) : '',
        phone: data.phone ? maskPhone(String(data.phone)) : '',
        rg: data.rg ? maskRG(String(data.rg)) : '',
        address_zip: data.address_zip ? maskCEP(String(data.address_zip)) : '',
      })
      setFieldErrors({})
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
    setFieldErrors({})
    try {
      const payload = { ...lead }
      payload.is_existing_client = !!payload.is_existing_client
      payload.has_previous_events = !!payload.has_previous_events
      if (
        payload.guest_count !== undefined &&
        payload.guest_count !== null &&
        payload.guest_count !== ''
      ) {
        payload.guest_count = Number(payload.guest_count)
      } else {
        payload.guest_count = null as any
      }
      if (!payload.email) payload.email = ''

      if (payload.cpf) payload.cpf = String(payload.cpf).replace(/\D/g, '')
      if (payload.phone) payload.phone = String(payload.phone).replace(/\D/g, '')
      if (payload.address_zip) payload.address_zip = String(payload.address_zip).replace(/\D/g, '')
      if (payload.rg) payload.rg = String(payload.rg).replace(/[.-]/g, '')

      await updateLead(leadId, payload)
      toast({ title: 'Sucesso', description: 'Lead atualizado com sucesso.' })
      onOpenChange(false)
    } catch (err: any) {
      const errors = extractFieldErrors(err)
      setFieldErrors(errors)

      if (errors.phone && lead.phone) {
        const existing = await getLeadByPhone(String(lead.phone).replace(/\D/g, ''))
        if (existing && existing.id !== leadId) {
          const ownerName = existing.expand?.profile_id?.name || 'outro vendedor'
          toast({
            title: 'Lead Duplicado',
            description: `Este lead já está cadastrado e sendo atendido por ${ownerName}.`,
            variant: 'destructive',
          })
          setLoading(false)
          return
        }
      }

      toast({
        title: 'Erro',
        description: getErrorMessage(err),
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
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl font-bold">{lead.name}</SheetTitle>
                {(() => {
                  const referenceDateStr = lead.last_contact_date || lead.created
                  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date()
                  const refDateOnly = new Date(
                    refDate.getFullYear(),
                    refDate.getMonth(),
                    refDate.getDate(),
                  )
                  const now = new Date()
                  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                  const diffTime = nowOnly.getTime() - refDateOnly.getTime()
                  const days = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
                  if (
                    days > 9 &&
                    lead.status !== 'Fechado' &&
                    lead.status !== 'Clientes Adormecidos'
                  ) {
                    return (
                      <Badge variant="destructive" className="animate-pulse h-5 text-[10px]">
                        {days} dias inativo
                      </Badge>
                    )
                  }
                  return null
                })()}
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <SheetDescription>Detalhes e histórico.</SheetDescription>
                <div className="flex items-center gap-2 ml-2">
                  <Select
                    value={lead.profile_id || ''}
                    onValueChange={(v) => setLead({ ...lead, profile_id: v })}
                    disabled={!!lead.profile_id && user?.role !== 'Gerente'}
                  >
                    <SelectTrigger className="h-6 text-xs w-[140px]">
                      <SelectValue placeholder="Vendedor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name || u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {lead.phone && (
                  <a
                    href={`https://wa.me/55${String(lead.phone).replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#25D366] text-white hover:bg-[#128C7E] h-6 px-2 py-1 gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                )}
              </div>
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
              <LeadTabContato lead={lead} onChange={setLead} fieldErrors={fieldErrors} />
            </TabsContent>
            <TabsContent value="familia" className="animate-fade-in">
              <LeadTabFamilia
                lead={lead}
                onChange={setLead}
                leadId={leadId}
                fieldErrors={fieldErrors}
              />
            </TabsContent>
            <TabsContent value="documentacao" className="animate-fade-in">
              <LeadTabDocumentacao lead={lead} onChange={setLead} fieldErrors={fieldErrors} />
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
