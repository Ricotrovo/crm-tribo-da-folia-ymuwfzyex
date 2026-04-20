import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
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
  AttendanceLog,
  getAttendanceLogs,
  createAttendanceLog,
  deleteAttendanceLog,
  getFreelancerFileUrl,
  getFreelancerByPhone,
  getFreelancerByCpf,
  FreelancerCategory,
  getFreelancerCategories,
  FreelancerEvaluation,
  getFreelancerEvaluations,
  createFreelancerEvaluation,
  deleteFreelancerEvaluation,
} from '@/services/freelancers'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Star } from 'lucide-react'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { maskPhone, maskCEP, calculateAge, maskCPF, validateCPF } from '@/lib/formatters'

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
  const [formData, setFormData] = useState<Partial<Freelancer>>({ status: 'Ativo', categories: [] })
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [allCategories, setAllCategories] = useState<FreelancerCategory[]>([])
  const [evaluations, setEvaluations] = useState<FreelancerEvaluation[]>([])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [age, setAge] = useState<number | null>(null)
  const isMinor = age !== null && age < 18

  const [authFile, setAuthFile] = useState<File | undefined>(undefined)

  const [newDate, setNewDate] = useState('')
  const [newStatus, setNewStatus] = useState<'scheduled' | 'present' | 'no_show'>('present')

  const [evalFreq, setEvalFreq] = useState(5)
  const [evalPunc, setEvalPunc] = useState(5)
  const [evalPart, setEvalPart] = useState(5)
  const [evalEduc, setEvalEduc] = useState(5)
  const [evalNotes, setEvalNotes] = useState('')

  useEffect(() => {
    if (open) {
      loadCategories()
      if (freelancer) {
        setFormData({ ...freelancer, categories: freelancer.categories || [] })
        loadDeps(freelancer.id)
      } else {
        setFormData({ status: 'Ativo', categories: [] })
        setLogs([])
        setEvaluations([])
      }
      setAuthFile(undefined)
      setFieldErrors({})
    }
  }, [freelancer, open])

  useEffect(() => {
    if (formData.birth_date) {
      const calc = calculateAge(formData.birth_date)
      setAge(calc)
    } else {
      setAge(null)
    }
  }, [formData.birth_date])

  const loadCategories = async () => {
    try {
      const cats = await getFreelancerCategories()
      setAllCategories(cats)
    } catch (e) {
      console.error(e)
    }
  }

  const loadDeps = async (id: string) => {
    try {
      const [l, evals] = await Promise.all([getAttendanceLogs(id), getFreelancerEvaluations(id)])
      setLogs(l)
      setEvaluations(evals)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCepChange = async (val: string) => {
    const masked = maskCEP(val)
    setFormData((prev) => ({ ...prev, address_zip: masked }))
    const clean = masked.replace(/\D/g, '')
    if (clean.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            address_street: data.logradouro || prev.address_street,
            address_neighborhood: data.bairro || prev.address_neighborhood,
            address_city: data.localidade || prev.address_city,
            address_state: data.uf || prev.address_state,
          }))
        }
      } catch (e) {
        console.error('Erro ao buscar CEP:', e)
      }
    }
  }

  const handleSaveData = async () => {
    setFieldErrors({})

    if (isMinor && (!formData.guardian_name || !formData.guardian_phone)) {
      setFieldErrors({
        guardian_name: !formData.guardian_name ? 'Obrigatório' : '',
        guardian_phone: !formData.guardian_phone ? 'Obrigatório' : '',
      })
      return toast({
        title: 'Atenção',
        description: 'Dados do responsável 1 são obrigatórios para menores de idade.',
        variant: 'destructive',
      })
    }

    if (!formData.cpf) {
      setFieldErrors((prev) => ({ ...prev, cpf: 'Obrigatório' }))
      return toast({
        title: 'Atenção',
        description: 'O CPF é obrigatório.',
        variant: 'destructive',
      })
    }

    const cleanCpf = formData.cpf.replace(/\D/g, '')
    if (!validateCPF(cleanCpf)) {
      setFieldErrors((prev) => ({ ...prev, cpf: 'CPF inválido.' }))
      return toast({
        title: 'Erro de validação',
        description: 'CPF inválido.',
        variant: 'destructive',
      })
    }

    setSaving(true)
    try {
      if (formData.phone) {
        const existing = await getFreelancerByPhone(formData.phone)
        if (existing && existing.id !== freelancer?.id) {
          setFieldErrors((prev) => ({ ...prev, phone: 'Telefone já cadastrado.' }))
          toast({
            title: 'Erro de validação',
            description: 'Telefone já cadastrado para outro freelancer.',
            variant: 'destructive',
          })
          setSaving(false)
          return
        }
      }

      const existingCpf = await getFreelancerByCpf(cleanCpf)
      if (existingCpf && existingCpf.id !== freelancer?.id) {
        setFieldErrors((prev) => ({ ...prev, cpf: 'CPF já cadastrado.' }))
        toast({
          title: 'Erro de validação',
          description: 'CPF já cadastrado para outro freelancer.',
          variant: 'destructive',
        })
        setSaving(false)
        return
      }

      const fd = new FormData()
      Object.keys(formData).forEach((key) => {
        const val = formData[key as keyof Freelancer]
        if (val !== undefined && val !== null) {
          if (key === 'categories') {
            ;(val as string[]).forEach((catId) => fd.append('categories', catId))
          } else if (key === 'cpf') {
            fd.append('cpf', cleanCpf)
          } else {
            fd.append(key, String(val))
          }
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

  const delLog = async (id: string) => {
    if (!freelancer) return
    await deleteAttendanceLog(id)
    loadDeps(freelancer.id)
    onSaved()
  }

  const handleAddEval = async () => {
    if (!freelancer?.id) return
    try {
      await createFreelancerEvaluation({
        freelancer_id: freelancer.id,
        frequency: evalFreq,
        punctuality: evalPunc,
        participation: evalPart,
        education: evalEduc,
        notes: evalNotes,
      })
      setEvalFreq(5)
      setEvalPunc(5)
      setEvalPart(5)
      setEvalEduc(5)
      setEvalNotes('')
      loadDeps(freelancer.id)
      toast({ title: 'Avaliação registrada.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const delEval = async (id: string) => {
    if (!freelancer) return
    await deleteFreelancerEvaluation(id)
    loadDeps(freelancer.id)
  }

  const RatingStars = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${onChange ? 'cursor-pointer' : ''} ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            onClick={() => onChange && onChange(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{freelancer ? freelancer.name : 'Novo Freelancer'}</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="dados" className="mt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="avaliacoes" disabled={!freelancer}>
              Avaliações
            </TabsTrigger>
            <TabsTrigger value="frequencia" disabled={!freelancer}>
              Frequência
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={
                    fieldErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''
                  }
                />
                {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  value={formData.cpf ? maskCPF(formData.cpf) : ''}
                  onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  className={
                    fieldErrors.cpf ? 'border-destructive focus-visible:ring-destructive' : ''
                  }
                />
                {fieldErrors.cpf && <p className="text-xs text-destructive">{fieldErrors.cpf}</p>}
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={formData.birth_date || ''}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
                {age !== null && <p className="text-xs text-muted-foreground">Idade: {age} anos</p>}
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                  placeholder="(99) 99999-9999"
                  className={
                    fieldErrors.phone ? 'border-destructive focus-visible:ring-destructive' : ''
                  }
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1">
                <Label>CEP</Label>
                <Input
                  value={formData.address_zip || ''}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Rua/Logradouro</Label>
                <Input
                  value={formData.address_street || ''}
                  onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1">
                <Label>Número</Label>
                <Input
                  value={formData.address_number || ''}
                  onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Complemento</Label>
                <Input
                  value={formData.address_complement || ''}
                  onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1">
                <Label>Bairro</Label>
                <Input
                  value={formData.address_neighborhood || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, address_neighborhood: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label>Cidade</Label>
                <Input
                  value={formData.address_city || ''}
                  onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label>UF</Label>
                <Input
                  value={formData.address_state || ''}
                  onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                  maxLength={2}
                />
              </div>
            </div>

            {isMinor && (
              <div className="space-y-4 bg-muted/20 p-4 rounded-lg border mt-2">
                <h4 className="font-semibold text-sm">Dados de Responsáveis (Menor de Idade)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Responsável 1 (Nome) *</Label>
                    <Input
                      value={formData.guardian_name || ''}
                      onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
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
                    <Label>Responsável 1 (Telefone) *</Label>
                    <Input
                      value={formData.guardian_phone || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, guardian_phone: maskPhone(e.target.value) })
                      }
                      placeholder="(99) 99999-9999"
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Responsável 2 (Nome)</Label>
                    <Input
                      value={formData.guardian_name_2 || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, guardian_name_2: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Responsável 2 (Telefone)</Label>
                    <Input
                      value={formData.guardian_phone_2 || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, guardian_phone_2: maskPhone(e.target.value) })
                      }
                      placeholder="(99) 99999-9999"
                    />
                  </div>
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
              <Label>Categorias / Especialidades</Label>
              <div className="grid grid-cols-2 gap-2 border p-3 rounded-md bg-muted/20">
                {allCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={formData.categories?.includes(cat.id)}
                      onCheckedChange={(checked) => {
                        const cur = formData.categories || []
                        if (checked) {
                          setFormData({ ...formData, categories: [...cur, cat.id] })
                        } else {
                          setFormData({
                            ...formData,
                            categories: cur.filter((id) => id !== cat.id),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`cat-${cat.id}`} className="font-normal cursor-pointer">
                      {cat.name}
                    </Label>
                  </div>
                ))}
                {allCategories.length === 0 && (
                  <span className="text-xs text-muted-foreground col-span-2">
                    Nenhuma categoria cadastrada.
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4">
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

            <Button
              onClick={handleSaveData}
              disabled={saving || !formData.name}
              className="w-full mt-4"
            >
              {saving ? 'Salvando...' : 'Salvar Dados'}
            </Button>
          </TabsContent>

          <TabsContent value="avaliacoes" className="space-y-4 mt-4">
            <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
              <h4 className="font-semibold text-sm">Nova Avaliação</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Frequência</Label>
                  <RatingStars value={evalFreq} onChange={setEvalFreq} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Pontualidade</Label>
                  <RatingStars value={evalPunc} onChange={setEvalPunc} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Participação</Label>
                  <RatingStars value={evalPart} onChange={setEvalPart} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Educação</Label>
                  <RatingStars value={evalEduc} onChange={setEvalEduc} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Observações</Label>
                <Textarea
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Comentários sobre o desempenho..."
                  className="h-16 text-sm"
                />
              </div>
              <Button size="sm" onClick={handleAddEval} className="w-full">
                Registrar Avaliação
              </Button>
            </div>

            <div className="space-y-3 mt-4">
              <h4 className="font-semibold text-sm">Histórico de Avaliações</h4>
              {evaluations.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada.</p>
              )}
              {evaluations.map((ev) => (
                <div key={ev.id} className="p-3 border rounded-md text-sm space-y-2 bg-card">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-muted-foreground font-medium">
                      {new Date(ev.created).toLocaleDateString('pt-BR')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={() => delEval(ev.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Frequência:</span>
                      <RatingStars value={ev.frequency} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Pontualidade:</span>
                      <RatingStars value={ev.punctuality} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Participação:</span>
                      <RatingStars value={ev.participation} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Educação:</span>
                      <RatingStars value={ev.education} />
                    </div>
                  </div>
                  {ev.notes && <p className="text-xs mt-2 bg-muted/50 p-2 rounded">{ev.notes}</p>}
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
                      className={`text-xs px-2 py-0.5 rounded-full ${l.status === 'present' ? 'bg-emerald-100 text-emerald-800' : l.status === 'no_show' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
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
