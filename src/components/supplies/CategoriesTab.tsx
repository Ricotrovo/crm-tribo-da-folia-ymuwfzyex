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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['product', 'service']),
})

export function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'product' as const },
  })

  const loadData = async () => {
    const res = await pb.collection('item_categories').getFullList()
    setCategories(res)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('item_categories', () => {
    loadData()
  })

  const onSubmit = async (data: any) => {
    try {
      await pb.collection('item_categories').create(data)
      setOpen(false)
      form.reset()
      toast({ title: 'Sucesso', description: 'Categoria criada' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestão de Categorias</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Nova Categoria</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input {...form.register('name')} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Produto (Físico)</SelectItem>
                        <SelectItem value="service">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar Categoria
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.type === 'product' ? 'Produto' : 'Serviço'}</TableCell>
            </TableRow>
          ))}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                Nenhuma categoria registrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
