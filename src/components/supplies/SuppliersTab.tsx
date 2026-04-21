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

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  document: z.string().optional(),
})

export function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', contact_person: '', phone: '', email: '', document: '' },
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

  const onSubmit = async (data: any) => {
    try {
      await pb.collection('suppliers').create(data)
      setOpen(false)
      form.reset()
      toast({ title: 'Sucesso', description: 'Fornecedor criado' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Fornecedores</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo Fornecedor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Fornecedor</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Razão Social / Nome</Label>
                <Input {...form.register('name')} />
              </div>
              <div className="space-y-2">
                <Label>Contato (Pessoa)</Label>
                <Input {...form.register('contact_person')} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input {...form.register('phone')} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input {...form.register('email')} />
              </div>
              <div className="space-y-2">
                <Label>Documento (CNPJ/CPF)</Label>
                <Input {...form.register('document')} />
              </div>
              <Button type="submit" className="w-full">
                Salvar Fornecedor
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
            <TableHead>Email</TableHead>
            <TableHead>Documento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>{s.contact_person || '-'}</TableCell>
              <TableCell>{s.phone || '-'}</TableCell>
              <TableCell>{s.email || '-'}</TableCell>
              <TableCell>{s.document || '-'}</TableCell>
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
