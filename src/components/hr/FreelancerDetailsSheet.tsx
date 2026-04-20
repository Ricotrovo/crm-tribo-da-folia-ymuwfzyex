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
} from '@/services/freelancers'
import { useToast } from '@/hooks/use-toast'
import { Trash2 } from 'lucide-react'

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

  const [newRole, setNewRole] = useState('')
  const [newPay, setNewPay] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newStatus, setNewStatus] = useState<'scheduled' | 'present' | 'no_show'>('present')

  useEffect(() => {
    if (open) {
      if (freelancer) {
        setFormData(freelancer)
        loadDeps(freelancer.id)
      } else {
        setFormData({ status: 'Ativo' })
        setRoles([])
        setLogs([])
      }
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
    setSaving(true)
    try {
      if (freelancer?.id) {
        await updateFreelancer(freelancer.id, formData)
        toast({ title: 'Sucesso', description: 'Freelancer atualizado.' })
      } else {
        await createFreelancer(formData)
        toast({ title: 'Sucesso', description: 'Freelancer criado.' })
        onOpenChange(false)
      }
      onSaved()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
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
              />
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
            <div className="space-y-2">
              <Label>Nome do Responsável (se menor)</Label>
              <Input
                value={formData.guardian_name || ''}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone do Responsável</Label>
              <Input
                value={formData.guardian_phone || ''}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
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
