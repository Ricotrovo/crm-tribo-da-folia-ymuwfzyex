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

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['product', 'service']),
  category_id: z.string().optional(),
  supplier_id: z.string().optional(),
  unit: z.enum(['un', 'box', 'package', 'kg', 'liter']).optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  base_price: z.coerce.number().min(0),
  additional_price: z.coerce.number().min(0).optional(),
  stock_quantity: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
})

export function ItemsTab() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [open, setOpen] = useState(false)
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

  const onSubmit = async (data: any) => {
    try {
      if (!isProduct) {
        data.stock_quantity = 0
        data.color = ''
        data.size = ''
        data.unit = ''
      }
      await pb.collection('items').create(data)
      setOpen(false)
      form.reset()
      toast({ title: 'Sucesso', description: 'Item cadastrado com sucesso.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const getUnitLabel = (unit: string) => {
    const units: Record<string, string> = {
      un: 'Unidade',
      box: 'Caixa',
      package: 'Pacote',
      kg: 'Kg',
      liter: 'Litro',
    }
    return units[unit] || ''
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Catálogo Global</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo Item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Item ou Serviço</DialogTitle>
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
                          <SelectItem value="product">Produto (Controla Estoque)</SelectItem>
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
                    <Label>Unidade de Medida</Label>
                    <Controller
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="un">Unidade</SelectItem>
                            <SelectItem value="box">Caixa</SelectItem>
                            <SelectItem value="package">Pacote</SelectItem>
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
                    <Label>Tamanho</Label>
                    <Input {...form.register('size')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estoque Inicial</Label>
                    <Input type="number" {...form.register('stock_quantity')} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Padrão (Base Price) R$</Label>
                  <Input type="number" step="0.01" {...form.register('base_price')} />
                </div>
                <div className="space-y-2">
                  <Label>Valor Adicional R$</Label>
                  <Input type="number" step="0.01" {...form.register('additional_price')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição / Notas</Label>
                <Input {...form.register('description')} />
              </div>

              <Button type="submit" className="w-full">
                Salvar Cadastro
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
            <TableHead>Categoria</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead className="text-right">Estoque</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((i) => {
            const total = (i.base_price || 0) + (i.additional_price || 0)
            return (
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
                <TableCell>{i.expand?.category_id?.name || '-'}</TableCell>
                <TableCell>{i.expand?.supplier_id?.name || '-'}</TableCell>
                <TableCell className="text-right">
                  {i.type === 'product'
                    ? `${i.stock_quantity || 0} ${getUnitLabel(i.unit || '')}`
                    : '-'}
                </TableCell>
                <TableCell className="text-right">R$ {total.toFixed(2)}</TableCell>
              </TableRow>
            )
          })}
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
