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
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['product', 'service']),
  category_id: z.string().optional(),
  supplier_id: z.string().optional(),
  unit: z.enum(['un', 'box', 'package', 'kg', 'liter']).optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  base_price: z.coerce.number().min(0).optional(),
  additional_price: z.coerce.number().min(0).optional(),
  cost_price: z.coerce.number().min(0).optional(),
  sale_price: z.coerce.number().min(0).optional(),
  included_quantity: z.coerce.number().min(0).optional(),
  stock_quantity: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
})

export function ItemsTab() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      type: 'product' as const,
      category_id: '',
      supplier_id: '',
      unit: 'un' as const,
      color: '',
      size: '',
      base_price: 0,
      additional_price: 0,
      cost_price: 0,
      sale_price: 0,
      included_quantity: 0,
      stock_quantity: 0,
      description: '',
    },
  })

  const type = useWatch({ control: form.control, name: 'type' })
  const isProduct = type === 'product'

  const loadData = async () => {
    const [resItems, resCats, resSups] = await Promise.all([
      pb.collection('items').getFullList({ expand: 'category_id,supplier_id' }),
      pb.collection('item_categories').getFullList(),
      pb.collection('suppliers').getFullList(),
    ])
    setItems(resItems)
    setCategories(resCats)
    setSuppliers(resSups)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('items', () => {
    loadData()
  })

  const handleEdit = (item: any) => {
    form.reset({
      ...item,
      category_id: item.category_id || '',
      supplier_id: item.supplier_id || '',
    })
    setEditingId(item.id)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este item?')) return
    try {
      await pb.collection('items').delete(id)
      toast({ title: 'Sucesso', description: 'Item excluído.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const onSubmit = async (data: any) => {
    try {
      if (!isProduct) {
        data.stock_quantity = 0
        data.color = ''
        data.size = ''
        data.unit = ''
      }
      if (editingId) {
        await pb.collection('items').update(editingId, data)
        toast({ title: 'Sucesso', description: 'Item atualizado.' })
      } else {
        await pb.collection('items').create(data)
        toast({ title: 'Sucesso', description: 'Item cadastrado.' })
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
        <h2 className="text-xl font-semibold">Catálogo Global</h2>
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
            <Button>Novo Item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Item' : 'Cadastrar Novo Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="product">Produto (Estoque)</SelectItem>
                          <SelectItem value="service">Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Controller
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((c) => c.type === type)
                            .map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Controller
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {isProduct && (
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-md border">
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Controller
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="un">Un</SelectItem>
                            <SelectItem value="box">Caixa</SelectItem>
                            <SelectItem value="package">Pct</SelectItem>
                            <SelectItem value="kg">Kg</SelectItem>
                            <SelectItem value="liter">Litro</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <Input {...form.register('color')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tam.</Label>
                    <Input {...form.register('size')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estoque</Label>
                    <Input type="number" {...form.register('stock_quantity')} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preço de Custo (R$)</Label>
                  <Input type="number" step="0.01" {...form.register('cost_price')} />
                </div>
                <div className="space-y-2">
                  <Label>Preço de Venda (R$)</Label>
                  <Input type="number" step="0.01" {...form.register('sale_price')} />
                </div>
                <div className="space-y-2">
                  <Label>Qtd Inclusa (Pacote)</Label>
                  <Input type="number" {...form.register('included_quantity')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição / Notas</Label>
                <Input {...form.register('description')} />
              </div>

              <Button type="submit" className="w-full">
                {editingId ? 'Salvar Alterações' : 'Salvar Cadastro'}
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
            <TableHead>Fornecedor</TableHead>
            <TableHead className="text-right">Venda (R$)</TableHead>
            <TableHead className="text-right">Qtd Inclusa</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="font-medium">
                {i.name}
                {i.color && (
                  <Badge variant="outline" className="ml-2">
                    {i.color}
                  </Badge>
                )}
                {i.size && (
                  <Badge variant="outline" className="ml-2">
                    {i.size}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{i.type === 'product' ? 'Produto' : 'Serviço'}</TableCell>
              <TableCell>{i.expand?.supplier_id?.name || '-'}</TableCell>
              <TableCell className="text-right font-medium text-green-600">
                {(i.sale_price || i.base_price || 0).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">{i.included_quantity || 0}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(i)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                Nenhum item cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
