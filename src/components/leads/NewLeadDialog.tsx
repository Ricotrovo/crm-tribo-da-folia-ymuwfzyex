import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createLead,
  updateLead,
  Lead,
  Child,
  getChildren,
  createChild,
  deleteChild,
  getLeadByPhone,
} from '@/services/leads'
import { getUsers, User as AppUser } from '@/services/users'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { maskPhone, maskCPF, maskRG, maskCEP, validateCPF, calculateAge } from '@/lib/formatters'
import { Plus, Trash2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { LeadInteractions } from './LeadInteractions'

export function NewLeadDialog({
  open,
  onOpenChange,
  onSuccess,
  lead,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  lead?: Lead
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Lead>>({ origin: 'WhatsApp', status: 'Novo' })
  const [children, setChildren] = useState<Partial<Child>[]>([])
  const [deletedChildrenIds, setDeletedChildrenIds] = useState<string[]>([])
  const [cpfError, setCpfError] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const { user } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error)
  }, [])

  useEffect(() => {
    if (open) {
      if (lead) {
        setFormData({
          ...lead,
          cpf: lead.cpf ? maskCPF(String(lead.cpf)) : '',
          phone: lead.phone ? maskPhone(String(lead.phone)) : '',
          rg: lead.rg ? maskRG(String(lead.rg)) : '',
          address_zip: lead.address_zip ? maskCEP(String(lead.address_zip)) : '',
        })
        loadChildren(lead.id)
      } else {
        setFormData({ origin: 'WhatsApp', status: 'Novo', profile_id: user?.id || null })
        setChildren([])
      }
      setDeletedChildrenIds([])
      setCpfError(false)
      setFieldErrors({})
    }
  }, [open, lead])

  const loadChildren = async (leadId: string) => {
    try {
      const data = await getChildren(leadId)
      setChildren(data)
    } catch (error) {
      console.error('Failed to load children:', error)
    }
  }

  const handleCepChange = async (val: string) => {
    const masked = maskCEP(val)
    setFormData((prev) => ({ ...prev, address_zip: masked }))

    const cleanCep = masked.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            address_street: data.logradouro,
            address_neighborhood: data.bairro,
            address_city: data.localidade,
            address_state: data.uf,
          }))
          toast({ title: 'Endereço preenchido via CEP' })
        }
      } catch (e) {
        console.error('Failed to fetch address via CEP:', e)
      }
    }
  }

  const addChild = () => {
    setChildren([...children, { name: '', birthday: '' }])
  }

  const updateChild = (index: number, field: keyof Child, value: string) => {
    const newChildren = [...children]
    newChildren[index] = { ...newChildren[index], [field]: value }
    setChildren(newChildren)
  }

  const removeChild = (index: number) => {
    const child = children[index]
    if (child.id) {
      setDeletedChildrenIds([...deletedChildrenIds, child.id])
    }
    setChildren(children.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cpfError) {
      toast({
        title: 'Atenção',
        description: 'Corrija o CPF antes de salvar.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setFieldErrors({})
    try {
      const payload = { ...formData }
      if (!payload.profile_id && user?.id) {
        payload.profile_id = user.id
      }
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

      let savedLead: Lead
      if (lead?.id) {
        savedLead = await updateLead(lead.id, payload)
        toast({ title: 'Lead atualizado com sucesso' })
      } else {
        savedLead = await createLead(payload)
        toast({ title: 'Lead criado com sucesso' })
      }

      // Process children
      for (const child of children) {
        if (child.id) {
          // Future: update child if needed
        } else if (child.name) {
          await createChild({ ...child, lead_id: savedLead.id })
        }
      }

      for (const id of deletedChildrenIds) {
        await deleteChild(id)
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      const errors = extractFieldErrors(error)
      setFieldErrors(errors)

      if (errors.phone && formData.phone) {
        const existing = await getLeadByPhone(String(formData.phone).replace(/\D/g, ''))
        if (existing && existing.id !== lead?.id) {
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
        title: 'Erro ao salvar lead',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Ficha do Lead' : 'Novo Lead'}</DialogTitle>
        </DialogHeader>

        <form id="lead-form" onSubmit={handleSubmit}>
          <Tabs defaultValue="basico" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basico">Dados Básicos</TabsTrigger>
              <TabsTrigger value="familia">Evento/Família</TabsTrigger>
              <TabsTrigger value="documentacao">Documentação</TabsTrigger>
              <TabsTrigger value="historico" disabled={!lead?.id}>
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-4 py-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nome Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ex: Maria Silva"
                    className={fieldErrors.name ? 'border-red-500' : ''}
                  />
                  {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp / Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                    placeholder="(11) 99999-9999"
                    className={fieldErrors.phone ? 'border-red-500' : ''}
                  />
                  {fieldErrors.phone && <p className="text-xs text-red-500">{fieldErrors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className={fieldErrors.email ? 'border-red-500' : ''}
                  />
                  {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram || ''}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin">Origem</Label>
                  <Select
                    value={formData.origin || 'WhatsApp'}
                    onValueChange={(v) => setFormData({ ...formData, origin: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Site">Site</SelectItem>
                      <SelectItem value="Indicação">Indicação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status do Lead</Label>
                  <Select
                    value={formData.status || 'Novo'}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Novo">Novo</SelectItem>
                      <SelectItem value="Contato Inicial">Contato Inicial</SelectItem>
                      <SelectItem value="Proposta">Proposta</SelectItem>
                      <SelectItem value="Visita">Visita</SelectItem>
                      <SelectItem value="Revisar">Revisar</SelectItem>
                      <SelectItem value="Clientes Adormecidos">Clientes Adormecidos</SelectItem>
                      <SelectItem value="Fechado">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Select
                    value={formData.temperature || ''}
                    onValueChange={(v) => setFormData({ ...formData, temperature: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quente">Quente 🔴</SelectItem>
                      <SelectItem value="Morno">Morno 🟠</SelectItem>
                      <SelectItem value="Frio">Frio 🔵</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_id">Vendedor (Responsável)</Label>
                  <Select
                    value={formData.profile_id || ''}
                    onValueChange={(v) => setFormData({ ...formData, profile_id: v })}
                    disabled={!!lead?.profile_id && user?.role !== 'Gerente'}
                  >
                    <SelectTrigger className={fieldErrors.profile_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o vendedor..." />
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
                <div className="space-y-2">
                  <Label htmlFor="referral_info">Indicação de quem?</Label>
                  <Input
                    id="referral_info"
                    value={formData.referral_info || ''}
                    onChange={(e) => setFormData({ ...formData, referral_info: e.target.value })}
                    placeholder="Nome da pessoa..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="dialog_existing_client"
                    checked={!!formData.is_existing_client}
                    onCheckedChange={(c) => setFormData({ ...formData, is_existing_client: c })}
                  />
                  <Label htmlFor="dialog_existing_client">Já é cliente?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="dialog_has_previous_events"
                    checked={!!formData.has_previous_events}
                    onCheckedChange={(c) => setFormData({ ...formData, has_previous_events: c })}
                  />
                  <Label htmlFor="dialog_has_previous_events">Já fez evento conosco?</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="familia" className="space-y-4 py-4 animate-fade-in">
              <h3 className="font-semibold text-sm border-b pb-2">Dados do Evento</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Data do Evento</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date || ''}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className={fieldErrors.event_date ? 'border-red-500' : ''}
                  />
                  {fieldErrors.event_date && (
                    <p className="text-xs text-red-500">{fieldErrors.event_date}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest_count">Qtd. Convidados</Label>
                  <Input
                    id="guest_count"
                    type="number"
                    value={formData.guest_count || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guest_count: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ex: 50"
                    className={fieldErrors.guest_count ? 'border-red-500' : ''}
                  />
                  {fieldErrors.guest_count && (
                    <p className="text-xs text-red-500">{fieldErrors.guest_count}</p>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-sm border-b pb-2">Família</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spouse_name">Cônjuge / Parceiro(a)</Label>
                  <Input
                    id="spouse_name"
                    value={formData.spouse_name || ''}
                    onChange={(e) => setFormData({ ...formData, spouse_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">Data de Nascimento (Responsável)</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday || ''}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm">Filhos / Aniversariantes</h3>
                <Button type="button" variant="outline" size="sm" onClick={addChild}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>
              {children.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  Nenhum filho adicionado a este lead.
                </p>
              ) : (
                <div className="space-y-3">
                  {children.map((child, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-end bg-muted/40 p-3 rounded-md border border-border/50"
                    >
                      <div className="space-y-2 flex-1">
                        <Label>Nome do Filho(a)</Label>
                        <Input
                          value={child.name || ''}
                          onChange={(e) => updateChild(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label>Nascimento</Label>
                        <Input
                          type="date"
                          value={child.birthday || ''}
                          onChange={(e) => updateChild(index, 'birthday', e.target.value)}
                        />
                      </div>
                      <div className="mb-2 w-16 text-center hidden sm:block">
                        <span className="text-sm font-medium text-muted-foreground">
                          {child.birthday ? `${calculateAge(child.birthday)} anos` : '-'}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 mb-0.5"
                        onClick={() => removeChild(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documentacao" className="space-y-4 py-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf || ''}
                    onChange={(e) => {
                      const val = maskCPF(e.target.value)
                      setFormData({ ...formData, cpf: val })
                      setCpfError(val.length === 14 && !validateCPF(val))
                    }}
                    placeholder="000.000.000-00"
                    className={cpfError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {cpfError && <p className="text-xs text-red-500 mt-1">CPF Inválido</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg || ''}
                    onChange={(e) => setFormData({ ...formData, rg: maskRG(e.target.value) })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="marital_status">Estado Civil</Label>
                  <Select
                    value={formData.marital_status || ''}
                    onValueChange={(v) => setFormData({ ...formData, marital_status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                      <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <h3 className="font-semibold text-sm">Endereço Residencial</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_zip">CEP</Label>
                  <Input
                    id="address_zip"
                    value={formData.address_zip || ''}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_street">Logradouro</Label>
                  <Input
                    id="address_street"
                    value={formData.address_street || ''}
                    onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    value={formData.address_number || ''}
                    onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_complement">Complemento</Label>
                  <Input
                    id="address_complement"
                    value={formData.address_complement || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address_complement: e.target.value })
                    }
                    placeholder="Apto, Bloco..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_neighborhood">Bairro</Label>
                  <Input
                    id="address_neighborhood"
                    value={formData.address_neighborhood || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address_neighborhood: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input
                    id="address_city"
                    value={formData.address_city || ''}
                    onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state">UF</Label>
                  <Input
                    id="address_state"
                    value={formData.address_state || ''}
                    onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="historico" className="py-4 animate-fade-in">
              {lead?.id ? (
                <LeadInteractions leadId={lead.id} />
              ) : (
                <div className="text-center py-10 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Salve o lead primeiro para habilitar o Histórico de Interações e CRM.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="lead-form" disabled={loading || cpfError}>
              {loading ? 'Salvando...' : 'Salvar Ficha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
