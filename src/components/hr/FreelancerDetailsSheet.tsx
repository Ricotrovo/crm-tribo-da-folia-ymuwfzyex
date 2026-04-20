import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Freelancer,
  createFreelancer,
  updateFreelancer,
  FreelancerRole,
  getFreelancerRoles,
  createFreelancerRole,
  deleteFreelancerRole,
  AttendanceLog,
  getAttendanceLogs,
  createAttendanceLog,
  deleteAttendanceLog,
  getFreelancerFileUrl,
  getFreelancerByPhone,
} from '@/services/freelancers'
import { useToast } from '@/hooks/use-toast'
import { Trash2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'

export function FreelancerDetailsSheet({
  freelancer,
  open,
  onOpenChange,
  onSaved,
}: {
  freelancer: Freelancer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [formData, setFormData] = useState<Partial<Freelancer>>({ status: 'Ativo' })
  const [roles, setRoles] = useState<FreelancerRole[]>([])
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [isMinor, setIsMinor] = useState(false)
  const [authFile, setAuthFile] = useState<File | undefined>(undefined)

  const [newRole, setNewRole] = useState('')
  const [newPay, setNewPay] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newStatus, setNewStatus] = useState<'scheduled' | 'present' | 'no_show'>('present')

  useEffect(() => {
    if (open) {
      if (freelancer) {
        setFormData(freelancer)
        setIsMinor(
          !!freelancer.guardian_name ||
            !!freelancer.guardian_phone ||
            !!freelancer.guardian_authorization,
        )
        loadDeps(freelancer.id)
      } else {
        setFormData({ status: 'Ativo' })
        setIsMinor(false)
        setRoles([])
        setLogs([])
      }
      setAuthFile(undefined)
      setFieldErrors({})
    }
  }, [freelancer, open])

  const loadDeps = async (id: string) => {
    try {
      const [r, l] = await Promise.all([getFreelancerRoles(id), getAttendanceLogs(id)])
      setRoles(r)
      setLogs(l)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveData = async () => {
    setFieldErrors({})

    if (isMinor && (!formData.guardian_name || !formData.guardian_phone)) {
      const errors: Record<string, string> = {}
      if (!formData.guardian_name) errors.guardian_name = 'Nome do responsável é obrigatório.'
      if (!formData.guardian_phone) errors.guardian_phone = 'Telefone do responsável é obrigatório.'
      setFieldErrors(errors)
      return toast({
        title: 'Atenção',
        description: 'Dados do responsável são obrigatórios para menores de idade.',
        variant: 'destructive',
      })
    }

    setSaving(true)
    try {
      if (formData.phone) {
        const existing = await getFreelancerByPhone(formData.phone)
        if (existing && existing.id !== freelancer?.id) {
          setFieldErrors({ phone: 'Este telefone já está cadastrado para outro freelancer.' })
          toast({
            title: 'Erro de validação',
            description: 'Este telefone já está cadastrado para outro freelancer.',
            variant: 'destructive',
          })
          setSaving(false)
          return
        }
      }

      const fd = new FormData()
      Object.keys(formData).forEach((key) => {
        const val = formData[key as keyof Freelancer]
        if (val !== undefined && val !== null) {
          fd.append(key, String(val))
        }
      })
      if (authFile) {
        fd.append('guardian_authorization', authFile)
      }

      if (freelancer?.id) {
        await updateFreelancer(freelancer.id, fd)
        toast({ title: 'Sucesso', description: 'Freelancer atualizado.' })
      } else {
        await createFreelancer(fd)
        toast({ title: 'Sucesso', description: 'Freelancer criado.' })
        onOpenChange(false)
      }
      onSaved()
    } catch (e: any) {
      const errors = extractFieldErrors(e)
      setFieldErrors(errors)
      toast({ title: 'Erro ao salvar', description: getErrorMessage(e), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddRole = async () => {
    if (!freelancer?.id || !newRole) return
    try {
      await createFreelancerRole({
        freelancer_id: freelancer.id,
        role_name: newRole,
        pay_rate: Number(newPay) || 0,
      })
      setNewRole('')
      setNewPay('')
      loadDeps(freelancer.id)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleAddLog = async () => {
    if (!freelancer?.id || !newDate) return
    try {
      await createAttendanceLog({ freelancer_id: freelancer.id, date: newDate, status: newStatus })
      setNewDate('')
      loadDeps(freelancer.id)
      onSaved()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const delRole = async (id: string) => {
    if (!freelancer) return
    await deleteFreelancerRole(id)
    loadDeps(freelancer.id)
  }

  const delLog = async (id: string) => {
    if (!freelancer) return
    await deleteAttendanceLog(id)
    loadDeps(freelancer.id)
    onSaved()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{freelancer ? freelancer.name : 'Novo Freelancer'}</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="dados" className="mt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="funcoes" disabled={!freelancer}>
              Funções
            </TabsTrigger>
            <TabsTrigger value="frequencia" disabled={!freelancer}>
              Frequência
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={
                  fieldErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''
                }
              />
              {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={
                    fieldErrors.phone ? 'border-destructive focus-visible:ring-destructive' : ''
                  }
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status || 'Ativo'}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2 mt-4 bg-muted/40 p-3 rounded-lg border">
              <Switch checked={isMinor} onCheckedChange={setIsMinor} id="is_minor" />
              <Label htmlFor="is_minor">É menor de idade? (Requer dados do responsável)</Label>
            </div>

            {isMinor && (
              <div className="space-y-4 bg-muted/20 p-4 rounded-lg border mt-2">
                <div className="space-y-2">
                  <Label>Nome do Responsável *</Label>
                  <Input
                    value={formData.guardian_name || ''}
                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                    required={isMinor}
                    className={
                      fieldErrors.guardian_name
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                  />
                  {fieldErrors.guardian_name && (
                    <p className="text-xs text-destructive">{fieldErrors.guardian_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Telefone do Responsável *</Label>
                  <Input
                    value={formData.guardian_phone || ''}
                    onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                    required={isMinor}
                    className={
                      fieldErrors.guardian_phone
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                  />
                  {fieldErrors.guardian_phone && (
                    <p className="text-xs text-destructive">{fieldErrors.guardian_phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Autorização do Responsável (PDF/JPEG)</Label>
                  <Input
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    onChange={(e) => setAuthFile(e.target.files?.[0] || undefined)}
                  />
                  {freelancer?.guardian_authorization && (
                    <a
                      href={getFreelancerFileUrl(freelancer, freelancer.guardian_authorization)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline inline-block mt-1"
                    >
                      Ver documento atual salvo
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2 mt-4">
              <Label>Nota Geral de Avaliação (0 a 10)</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={formData.overall_rating || ''}
                onChange={(e) =>
                  setFormData({ ...formData, overall_rating: Number(e.target.value) })
                }
              />
            </div>
            <Button
              onClick={handleSaveData}
              disabled={saving || !formData.name}
              className="w-full mt-4"
            >
              {saving ? 'Salvando...' : 'Salvar Dados'}
            </Button>
          </TabsContent>

          <TabsContent value="funcoes" className="space-y-4 mt-4">
            <div className="flex gap-2 items-end bg-muted/40 p-3 rounded-lg border">
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Função</Label>
                <Input
                  className="h-8 text-xs"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Ex: Monitor"
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Valor/Hora (R$)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs"
                  value={newPay}
                  onChange={(e) => setNewPay(e.target.value)}
                />
              </div>
              <Button size="sm" className="h-8" onClick={handleAddRole} disabled={!newRole}>
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {roles.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 border rounded-md text-sm"
                >
                  <span>
                    {r.role_name} - <span className="text-muted-foreground">R$ {r.pay_rate}/h</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => delRole(r.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="frequencia" className="space-y-4 mt-4">
            <div className="flex gap-2 items-end bg-muted/40 p-3 rounded-lg border">
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Status</Label>
                <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="present">Presente</SelectItem>
                    <SelectItem value="no_show">Faltou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="h-8" onClick={handleAddLog} disabled={!newDate}>
                Registrar
              </Button>
            </div>
            <div className="space-y-2">
              {logs.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between p-2 border rounded-md text-sm"
                >
                  <span>{new Date(l.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        l.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.status === 'no_show'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {l.status === 'present'
                        ? 'Presente'
                        : l.status === 'no_show'
                          ? 'Falta'
                          : 'Agendado'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => delLog(l.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
