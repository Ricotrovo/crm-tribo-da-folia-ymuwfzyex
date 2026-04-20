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
  User,
  updateUser,
  createUser,
  getEmployeeDocuments,
  EmployeeDocument,
  deleteEmployeeDocument,
} from '@/services/users'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Download, Eye } from 'lucide-react'

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

  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState('Identificação')
  const [docDesc, setDocDesc] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (open) {
      if (user) {
        setFormData(user)
        loadDocs(user.id)
      } else {
        setFormData({})
        setPassword('')
        setDocs([])
      }
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
    setSaving(true)
    try {
      if (user) {
        await updateUser(user.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          role_title: formData.role_title,
          salary: formData.salary ? Number(formData.salary) : undefined,
          admission_date: formData.admission_date,
          vacation_info: formData.vacation_info,
          crm_access_level: formData.crm_access_level || 'none',
        })
        toast({ title: 'Sucesso', description: 'Dados atualizados.' })
        onSaved()
      } else {
        if (!password) throw new Error('Senha é obrigatória para novos funcionários.')
        if (!formData.email) throw new Error('E-mail é obrigatório.')

        await createUser({
          name: formData.name,
          email: formData.email,
          password: password,
          passwordConfirm: password,
          role: formData.role,
          role_title: formData.role_title,
          salary: formData.salary ? Number(formData.salary) : undefined,
          admission_date: formData.admission_date,
          vacation_info: formData.vacation_info,
          crm_access_level: formData.crm_access_level || 'none',
        })
        toast({ title: 'Sucesso', description: 'Funcionário criado.' })
        onSaved()
        onOpenChange(false)
      }
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{user ? `${user.name} - Detalhes` : 'Novo Funcionário'}</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="dados" className="mt-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="dados">Dados Profissionais</TabsTrigger>
            <TabsTrigger value="documentos" disabled={!user}>
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            {!user && (
              <div className="space-y-2">
                <Label>Senha Temporária *</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
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
              <Label>Salário (R$)</Label>
              <Input
                type="number"
                value={formData.salary || ''}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Admissão</Label>
              <Input
                type="date"
                value={formData.admission_date || ''}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Controle de Férias</Label>
              <Input
                value={formData.vacation_info || ''}
                onChange={(e) => setFormData({ ...formData, vacation_info: e.target.value })}
                placeholder="Período aquisitivo, etc."
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
            <Button
              onClick={handleSave}
              disabled={saving || !formData.email || (!user && !password)}
              className="w-full mt-4"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4 mt-4">
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
              <Button type="submit" size="sm" disabled={uploading || !file} className="w-full h-8">
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
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
