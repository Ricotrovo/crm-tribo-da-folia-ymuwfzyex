import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Pencil, Trash2, Search } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  secondary_phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  secondary_email: z.string().email('Email inválido').optional().or(z.literal('')),
  document: z.string().optional(),
  address_zip: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  pix_key: z.string().optional(),
})

export function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      contact_person: '',
      phone: '',
      secondary_phone: '',
      email: '',
      secondary_email: '',
      document: '',
      address_zip: '',
      address_street: '',
      address_number: '',
      address_complement: '',
      address_neighborhood: '',
      address_city: '',
      address_state: '',
      pix_key: '',
    },
  })

  const loadData = async () => {
    const res = await pb.collection('suppliers').getFullList()
    setSuppliers(res)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('suppliers', () => {
    loadData()
  })

  const searchCEP = async (cep: string) => {
    if (!cep) return
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await res.json()
      if (!data.erro) {
        form.setValue('address_street', data.logradouro)
        form.setValue('address_neighborhood', data.bairro)
        form.setValue('address_city', data.localidade)
        form.setValue('address_state', data.uf)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleEdit = (supplier: any) => {
    form.reset({ ...supplier })
    setEditingId(supplier.id)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este fornecedor?')) return
    try {
      await pb.collection('suppliers').delete(id)
      toast({ title: 'Sucesso', description: 'Fornecedor excluído' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        await pb.collection('suppliers').update(editingId, data)
        toast({ title: 'Sucesso', description: 'Fornecedor atualizado' })
      } else {
        await pb.collection('suppliers').create(data)
        toast({ title: 'Sucesso', description: 'Fornecedor criado' })
      }
      setOpen(false)
      setEditingId(null)
      form.reset()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Fornecedores</h2>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) {
              setEditingId(null)
              form.reset()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>Novo Fornecedor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div>
                <h3 className="font-medium text-sm border-b pb-2 mb-3">Dados Principais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Razão Social / Nome</Label>
                    <Input {...form.register('name')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Documento (CNPJ/CPF)</Label>
                    <Input {...form.register('document')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contato (Pessoa)</Label>
                    <Input {...form.register('contact_person')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Chave PIX</Label>
                    <Input {...form.register('pix_key')} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm border-b pb-2 mb-3">Contatos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone Principal</Label>
                    <Input {...form.register('phone')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone Secundário</Label>
                    <Input {...form.register('secondary_phone')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Principal</Label>
                    <Input {...form.register('email')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Secundário</Label>
                    <Input {...form.register('secondary_email')} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm border-b pb-2 mb-3">Endereço</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        {...form.register('address_zip')}
                        onBlur={(e) => searchCEP(e.target.value)}
                        placeholder="00000-000"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => searchCEP(form.getValues('address_zip'))}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Rua</Label>
                    <Input {...form.register('address_street')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input {...form.register('address_number')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input {...form.register('address_neighborhood')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input {...form.register('address_complement')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade/UF</Label>
                    <div className="flex gap-2">
                      <Input {...form.register('address_city')} className="flex-1" />
                      <Input {...form.register('address_state')} className="w-16" maxLength={2} />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingId ? 'Salvar Alterações' : 'Salvar Fornecedor'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>PIX</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>{s.contact_person || '-'}</TableCell>
              <TableCell>{s.phone || '-'}</TableCell>
              <TableCell>{s.pix_key || '-'}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {suppliers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                Nenhum fornecedor registrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
