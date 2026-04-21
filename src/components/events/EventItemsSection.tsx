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
import { Checkbox } from '@/components/ui/checkbox'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { FileText, Receipt, Trash2 } from 'lucide-react'

const schema = z.object({
  item_id: z.string().min(1, 'Item é obrigatório'),
  quantity: z.coerce.number().min(1, 'Quantidade inválida'),
  unit_price: z.coerce.number().min(0, 'Valor inválido'),
  notes: z.string().optional(),
  deduct_stock: z.boolean().default(false),
})

export function EventItemsSection({ eventId }: { eventId: string }) {
  const [eventItems, setEventItems] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { item_id: '', quantity: 1, unit_price: 0, notes: '', deduct_stock: true },
  })

  const selectedItemId = useWatch({ control: form.control, name: 'item_id' })
  const selectedItem = items.find((i) => i.id === selectedItemId)

  const watchQuantity = useWatch({ control: form.control, name: 'quantity' }) || 1
  const watchUnitPrice = useWatch({ control: form.control, name: 'unit_price' }) || 0
  const includedQty = selectedItem?.included_quantity || 0
  const extraQty = Math.max(0, watchQuantity - includedQty)
  const calculatedTotal = extraQty * watchUnitPrice

  useEffect(() => {
    if (selectedItem) {
      form.setValue('unit_price', selectedItem.sale_price || selectedItem.base_price || 0)
    }
  }, [selectedItem, form])

  const loadData = async () => {
    const [resEventItems, resItems] = await Promise.all([
      pb
        .collection('event_items')
        .getFullList({ filter: `event_id = "${eventId}"`, expand: 'item_id,supplier_id' }),
      pb.collection('items').getFullList({ expand: 'supplier_id' }),
    ])
    setEventItems(resEventItems)
    setItems(resItems)
  }

  useEffect(() => {
    loadData()
  }, [eventId])
  useRealtime('event_items', () => {
    loadData()
  })
  useRealtime('items', () => {
    loadData()
  })

  const onSubmit = async (data: any) => {
    try {
      if (!selectedItem) throw new Error('Item não encontrado')
      await pb.collection('event_items').create({
        event_id: eventId,
        item_id: selectedItem.id,
        supplier_id: selectedItem.supplier_id,
        quantity: data.quantity,
        unit_price: data.unit_price,
        total_price: calculatedTotal,
        notes: data.notes,
      })

      if (data.deduct_stock && selectedItem.type === 'product') {
        const newStock = Math.max(0, (selectedItem.stock_quantity || 0) - data.quantity)
        await pb.collection('items').update(selectedItem.id, { stock_quantity: newStock })
      }

      setOpen(false)
      form.reset()
      toast({ title: 'Sucesso', description: 'Adicionado ao evento' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este item do evento?')) return
    try {
      await pb.collection('event_items').delete(id)
      toast({ title: 'Sucesso', description: 'Item removido do evento.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const groupedBySupplier = eventItems.reduce(
    (acc, curr) => {
      const supId = curr.supplier_id
      if (!acc[supId]) acc[supId] = { supplier: curr.expand?.supplier_id, items: [], total: 0 }
      acc[supId].items.push(curr)
      acc[supId].total += curr.total_price || 0
      return acc
    },
    {} as Record<string, any>,
  )

  return (
    <Tabs defaultValue="list" className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Resumo do Evento
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" /> Por Fornecedor
          </TabsTrigger>
        </TabsList>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Adicionar Item / Serviço</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Item ao Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Item do Catálogo</Label>
                <Controller
                  control={form.control}
                  name="item_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.name} {i.type === 'product' ? `(Est: ${i.stock_quantity || 0})` : ''}{' '}
                            - {i.expand?.supplier_id?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade Total</Label>
                  <Input type="number" min={1} {...form.register('quantity')} />
                </div>
                <div className="space-y-2">
                  <Label>Preço Unitário (R$)</Label>
                  <Input type="number" step="0.01" {...form.register('unit_price')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input {...form.register('notes')} />
              </div>

              {selectedItem && (
                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Qtd Inclusa no Pacote:</span>
                    <span className="font-semibold">{includedQty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qtd Extra Cobrada:</span>
                    <span className="font-semibold">{extraQty}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t mt-2">
                    <span>Total a Cobrar:</span>
                    <span className="font-bold text-primary">R$ {calculatedTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {selectedItem?.type === 'product' && (
                <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-md border">
                  <Controller
                    control={form.control}
                    name="deduct_stock"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="deduct"
                      />
                    )}
                  />
                  <Label htmlFor="deduct" className="cursor-pointer">
                    Deduzir {watchQuantity} do estoque global
                  </Label>
                </div>
              )}
              <Button type="submit" className="w-full">
                Confirmar e Adicionar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <TabsContent value="list" className="animate-in fade-in">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Qtd Total</TableHead>
              <TableHead className="text-right">Total Extra</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventItems.map((ei) => (
              <TableRow key={ei.id}>
                <TableCell className="font-medium">
                  {ei.expand?.item_id?.name}
                  {ei.notes && (
                    <span className="block text-xs text-muted-foreground">{ei.notes}</span>
                  )}
                </TableCell>
                <TableCell>{ei.expand?.supplier_id?.name}</TableCell>
                <TableCell className="text-right">{ei.quantity}</TableCell>
                <TableCell className="text-right font-medium">
                  R$ {(ei.total_price || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ei.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {eventItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  Nenhum item adicionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="suppliers" className="animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(groupedBySupplier).map((group: any, idx) => (
            <div key={idx} className="border rounded-lg p-5 shadow-sm bg-card flex flex-col h-full">
              <div className="border-b pb-3 mb-3">
                <h3 className="font-bold text-lg text-primary">{group.supplier?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {group.supplier?.contact_person} • {group.supplier?.phone}
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {group.items.map((ei: any) => (
                  <div key={ei.id} className="flex justify-between items-center text-sm">
                    <span className="flex-1">
                      {ei.expand?.item_id?.name}{' '}
                      <span className="text-muted-foreground">(x{ei.quantity})</span>
                    </span>
                    <span className="font-medium">R$ {(ei.total_price || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mt-4 flex justify-between items-center">
                <span className="font-bold">Total a Pagar:</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {group.total.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          {Object.keys(groupedBySupplier).length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Nenhum fornecedor vinculado a este evento.
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
