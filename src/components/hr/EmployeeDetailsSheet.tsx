import { useState, useEffect, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  updateUser,
  createUser,
  getEmployeeDocuments,
  EmployeeDocument,
  deleteEmployeeDocument,
} from '@/services/users'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Eye } from 'lucide-react'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { maskCPF, maskPhone, maskRG, maskCEP, validateCPF } from '@/lib/formatters'

export function EmployeeDetailsSheet({
  user,
  open,
  onOpenChange,
  onSaved,
}: {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [formData, setFormData] = useState<Partial<User>>({})
  const [password, setPassword] = useState('')
  const [docs, setDocs] = useState<EmployeeDocument[]>([])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState('Identificação')
  const [docDesc, setDocDesc] = useState('')
  const [uploading, setUploading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [cpfError, setCpfError] = useState(false)

  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          ...user,
          cpf: user.cpf ? maskCPF(user.cpf) : '',
          phone: user.phone ? maskPhone(user.phone) : '',
          rg: user.rg ? maskRG(user.rg) : '',
          address_zip: user.address_zip ? maskCEP(user.address_zip) : '',
        })
        loadDocs(user.id)
      } else {
        setFormData({})
        setPassword('')
        setDocs([])
      }
      setAvatarFile(null)
      setFieldErrors({})
      setCpfError(false)
    }
  }, [user, open])

  const loadDocs = async (id: string) => {
    try {
      const data = await getEmployeeDocuments(id)
      setDocs(data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async () => {
    setFieldErrors({})

    if (cpfError || (formData.cpf && formData.cpf.length === 14 && !validateCPF(formData.cpf))) {
      toast({
        title: 'Atenção',
        description: 'Corrija o CPF antes de salvar.',
        variant: 'destructive',
      })
      return
    }

    if (!user) {
      const errors: Record<string, string> = {}
      if (!password) errors.password = 'Senha é obrigatória para novos funcionários.'
      else if (password.length < 8) errors.password = 'A senha deve ter no mínimo 8 caracteres.'
      if (!formData.email) errors.email = 'E-mail é obrigatório.'

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        toast({
          title: 'Erro de validação',
          description: Object.values(errors)[0],
          variant: 'destructive',
        })
        return
      }
    }

    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (
          [
            'id',
            'created',
            'updated',
            'collectionId',
            'collectionName',
            'avatar',
            'expand',
          ].includes(key)
        )
          return
        if (value !== undefined && value !== null) {
          if (key === 'cpf' || key === 'phone' || key === 'address_zip') {
            fd.append(key, String(value).replace(/\D/g, ''))
          } else if (key === 'rg') {
            fd.append(key, String(value).replace(/[.-]/g, ''))
          } else {
            fd.append(key, String(value))
          }
        }
      })

      if (!user) {
        fd.append('password', password)
        fd.append('passwordConfirm', password)
      }

      if (avatarFile) {
        fd.append('avatar', avatarFile)
      }

      if (user) {
        await updateUser(user.id, fd)
        toast({ title: 'Sucesso', description: 'Dados atualizados.' })
        onSaved()
        onOpenChange(false)
      } else {
        await createUser(fd)
        toast({ title: 'Sucesso', description: 'Funcionário criado.' })
        onSaved()
        onOpenChange(false)
      }
    } catch (e: any) {
      const errors = extractFieldErrors(e)
      if (errors.cpf && errors.cpf.toLowerCase().includes('unique')) {
        errors.cpf = 'Este CPF já está cadastrado para outro funcionário'
      }
      setFieldErrors(errors)
      toast({ title: 'Erro ao salvar', description: getErrorMessage(e), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !user) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('user_id', user.id)
      fd.append('file', file)
      fd.append('doc_type', docType)
      fd.append('description', docDesc)
      await pb.collection('employee_documents').create(fd)
      setFile(null)
      setDocDesc('')
      loadDocs(user.id)
      toast({ title: 'Documento enviado.' })
    } catch (e: any) {
      toast({ title: 'Erro ao enviar', description: e.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleDelDoc = async (id: string) => {
    if (!user) return
    try {
      await deleteEmployeeDocument(id)
      loadDocs(user.id)
      toast({ title: 'Documento excluído.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const avatarUrl = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile)
    if (user?.avatar) return pb.files.getUrl(user, user.avatar, { thumb: '100x100' })
    return ''
  }, [avatarFile, user])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl flex flex-col h-full p-0">
        <div className="p-6 pb-2 border-b">
          <SheetHeader>
            <SheetTitle>{user ? `${user.name} - Detalhes` : 'Novo Funcionário'}</SheetTitle>
            <SheetDescription>
              {user
                ? 'Edite as informações do funcionário abaixo.'
                : 'Preencha os dados para registrar um novo funcionário.'}
            </SheetDescription>
          </SheetHeader>
        </div>

        <Tabs defaultValue="perfil" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-2">
            <TabsList className="w-full flex h-10">
              <TabsTrigger value="perfil" className="flex-1">
                Perfil
              </TabsTrigger>
              <TabsTrigger value="profissional" className="flex-1">
                Profissional
              </TabsTrigger>
              <TabsTrigger value="contato" className="flex-1">
                Contato
              </TabsTrigger>
              <TabsTrigger value="documentos" disabled={!user} className="flex-1">
                Docs
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6 pt-4">
            <TabsContent value="perfil" className="space-y-4 m-0">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16 border">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{formData.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <Label>Foto de Perfil</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="text-xs h-8 w-64"
                  />
                  {fieldErrors.avatar && (
                    <p className="text-xs text-destructive">{fieldErrors.avatar}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={fieldErrors.name ? 'border-destructive' : ''}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-destructive">{fieldErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={fieldErrors.email ? 'border-destructive' : ''}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
                {!user && (
                  <div className="space-y-2">
                    <Label>Senha Temporária *</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Mínimo de 8 caracteres"
                      className={fieldErrors.password ? 'border-destructive' : ''}
                    />
                    {fieldErrors.password && (
                      <p className="text-xs text-destructive">{fieldErrors.password}</p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={formData.cpf || ''}
                    onChange={(e) => {
                      const val = maskCPF(e.target.value)
                      setFormData({ ...formData, cpf: val })
                      setCpfError(val.length === 14 && !validateCPF(val))
                    }}
                    placeholder="000.000.000-00"
                    className={
                      cpfError || fieldErrors.cpf
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                  />
                  {cpfError && <p className="text-xs text-destructive">CPF inválido</p>}
                  {!cpfError && fieldErrors.cpf && (
                    <p className="text-xs text-destructive">{fieldErrors.cpf}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>RG</Label>
                  <Input
                    value={formData.rg || ''}
                    onChange={(e) => setFormData({ ...formData, rg: maskRG(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Perfil de Acesso (Role)</Label>
                  <Select
                    value={formData.role || ''}
                    onValueChange={(v) => setFormData({ ...formData, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Administrador</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="Vendedor">Vendedor</SelectItem>
                      <SelectItem value="Operacional">Operacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cargo / Título</Label>
                  <Input
                    value={formData.role_title || ''}
                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                    placeholder="Ex: Vendedor Sênior"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nível de Acesso no CRM</Label>
                  <Select
                    value={formData.crm_access_level || 'none'}
                    onValueChange={(v) => setFormData({ ...formData, crm_access_level: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem Acesso</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="full">Total (Gerente)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profissional" className="space-y-4 m-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Admissão</Label>
                  <Input
                    type="date"
                    value={formData.admission_date || ''}
                    onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salário (R$)</Label>
                  <Input
                    type="number"
                    value={formData.salary || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salary: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Controle de Férias</Label>
                  <Input
                    value={formData.vacation_info || ''}
                    onChange={(e) => setFormData({ ...formData, vacation_info: e.target.value })}
                    placeholder="Período aquisitivo, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carteira de Trabalho (CTPS) - Número</Label>
                  <Input
                    value={formData.work_permit_number || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, work_permit_number: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTPS - Série</Label>
                  <Input
                    value={formData.work_permit_series || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, work_permit_series: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria CNH</Label>
                  <Input
                    value={formData.cnh_category || ''}
                    onChange={(e) => setFormData({ ...formData, cnh_category: e.target.value })}
                    placeholder="Ex: AB"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chave PIX</Label>
                  <Input
                    value={formData.pix_key || ''}
                    onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                    placeholder="E-mail, CPF, Telefone ou Aleatória"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contato" className="space-y-6 m-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone / WhatsApp</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contato de Emergência</Label>
                  <Input
                    value={formData.emergency_contact || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, emergency_contact: e.target.value })
                    }
                    placeholder="Nome e Telefone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input
                    value={formData.instagram || ''}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label>TikTok</Label>
                  <Input
                    value={formData.tiktok || ''}
                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 border-b pb-2">Endereço</h4>
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>CEP</Label>
                    <Input
                      value={formData.address_zip || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, address_zip: maskCEP(e.target.value) })
                      }
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-4">
                    <Label>Rua / Logradouro</Label>
                    <Input
                      value={formData.address_street || ''}
                      onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Número</Label>
                    <Input
                      value={formData.address_number || ''}
                      onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-4">
                    <Label>Bairro</Label>
                    <Input
                      value={formData.address_neighborhood || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, address_neighborhood: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-4">
                    <Label>Cidade</Label>
                    <Input
                      value={formData.address_city || ''}
                      onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Estado (UF)</Label>
                    <Input
                      value={formData.address_state || ''}
                      onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                      placeholder="Ex: SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documentos" className="space-y-4 m-0">
              <form onSubmit={handleUpload} className="space-y-3 bg-muted/40 p-4 rounded-lg border">
                <h4 className="text-sm font-semibold">Novo Documento</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Identificação">Identificação</SelectItem>
                        <SelectItem value="Contrato">Contrato</SelectItem>
                        <SelectItem value="Atestado">Atestado Médico</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descrição</Label>
                    <Input
                      className="h-8 text-xs"
                      value={docDesc}
                      onChange={(e) => setDocDesc(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Arquivo (PDF, JPEG, PNG)</Label>
                  <Input
                    type="file"
                    className="h-8 text-xs"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    accept=".pdf,image/jpeg,image/png"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={uploading || !file}
                  className="w-full h-8"
                >
                  {uploading ? 'Enviando...' : 'Fazer Upload'}
                </Button>
              </form>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Repositório</h4>
                {docs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>
                ) : (
                  docs.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-card"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{d.doc_type}</span>
                        <span className="text-xs text-muted-foreground">
                          {d.description || d.file}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-1">
                          {new Date(d.created).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <a href={pb.files.getUrl(d, d.file)} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelDoc(d.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </ScrollArea>

          <div className="p-6 pt-4 border-t bg-background mt-auto">
            <Button
              onClick={handleSave}
              disabled={saving || !formData.email || (!user && !password)}
              className="w-full"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
