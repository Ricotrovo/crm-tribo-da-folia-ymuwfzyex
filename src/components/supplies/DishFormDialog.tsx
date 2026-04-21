import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'
import {
  createDish,
  updateDish,
  getDishIngredients,
  createDishIngredient,
  updateDishIngredient,
  deleteDishIngredient,
} from '@/services/dishes'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { getUnitHint } from '@/lib/scaling'

export function DishFormDialog({ open, onOpenChange, dish, onSaved }: any) {
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Prato Principal')
  const [description, setDescription] = useState('')
  const [baseSalePrice, setBaseSalePrice] = useState('')
  const [isOptional, setIsOptional] = useState(false)
  const [ingredients, setIngredients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open)
      pb.collection('items')
        .getFullList({ filter: 'type="product"' })
        .then(setItems)
        .catch(console.error)
  }, [open])

  useEffect(() => {
    if (open) {
      if (dish) {
        setName(dish.name)
        setCategory(dish.category || 'Prato Principal')
        setDescription(dish.description || '')
        setBaseSalePrice(dish.base_sale_price?.toString() || '')
        setIsOptional(dish.is_optional || false)
        getDishIngredients(dish.id).then((ings) => {
          setIngredients(
            ings.map((i: any) => ({
              id: i.id,
              item_id: i.item_id,
              base_quantity_50: i.base_quantity_50?.toString(),
              increment_quantity_10: i.increment_quantity_10?.toString(),
              item: i.expand?.item_id,
            })),
          )
        })
      } else {
        setName('')
        setCategory('Prato Principal')
        setDescription('')
        setBaseSalePrice('')
        setIsOptional(false)
        setIngredients([])
      }
    }
  }, [open, dish])

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { item_id: '', base_quantity_50: '0', increment_quantity_10: '0' },
    ])
  }

  const handleRemoveIngredient = (index: number) => {
    const newIngs = [...ingredients]
    newIngs.splice(index, 1)
    setIngredients(newIngs)
  }

  const handleSave = async () => {
    if (!name) return toast({ title: 'Nome é obrigatório', variant: 'destructive' })
    if (ingredients.some((i) => !i.item_id))
      return toast({ title: 'Selecione um item para todos os insumos', variant: 'destructive' })

    setLoading(true)
    try {
      const dishData = {
        name,
        category,
        description,
        base_sale_price: Number(baseSalePrice) || 0,
        is_optional: isOptional,
      }

      let savedDishId = dish?.id
      if (dish) {
        await updateDish(dish.id, dishData)
      } else {
        const newDish = await createDish(dishData)
        savedDishId = newDish.id
      }

      const existingIngs = dish ? await getDishIngredients(dish.id) : []
      const existingIds = existingIngs.map((i: any) => i.id)

      for (const ing of ingredients) {
        const ingData = {
          dish_id: savedDishId,
          item_id: ing.item_id,
          base_quantity_50: Number(ing.base_quantity_50) || 0,
          increment_quantity_10: Number(ing.increment_quantity_10) || 0,
        }
        if (ing.id) {
          await updateDishIngredient(ing.id, ingData)
          const idx = existingIds.indexOf(ing.id)
          if (idx !== -1) existingIds.splice(idx, 1)
        } else {
          await createDishIngredient(ingData)
        }
      }

      for (const idToRemove of existingIds) {
        await deleteDishIngredient(idToRemove)
      }

      toast({ title: 'Prato salvo com sucesso!' })
      onSaved()
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const estimatedCost = ingredients.reduce((acc, ing) => {
    const item = items.find((i) => i.id === ing.item_id)
    if (!item) return acc
    return acc + (item.cost_price || 0) * (Number(ing.base_quantity_50) || 0)
  }, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dish ? 'Alterar Prato / Receita' : 'Incluir Novo Prato'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prato Principal">Prato Principal</SelectItem>
                <SelectItem value="Sobremesa">Sobremesa</SelectItem>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Acompanhamento">Acompanhamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Descrição / Modo de Preparo</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="col-span-2 p-4 bg-muted/30 rounded-lg flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch checked={isOptional} onCheckedChange={setIsOptional} />
              <Label>Item Opcional (Vendido à parte)</Label>
            </div>
            {isOptional && (
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">Preço de Venda Base (R$):</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={baseSalePrice}
                  onChange={(e) => setBaseSalePrice(e.target.value)}
                  className="w-32"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Ficha Técnica (Insumos)</h3>
              <p className="text-sm text-muted-foreground">
                Quantidades suportam até 3 casas decimais. Base de cálculo: 50 convidados.
              </p>
            </div>
            <Button size="sm" onClick={handleAddIngredient}>
              <Plus className="w-4 h-4 mr-2" /> Incluir Insumo
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead className="w-40">Qtd (50 conv.)</TableHead>
                  <TableHead className="w-40">Acréscimo (10 conv.)</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing, idx) => {
                  const selItem = items.find((i) => i.id === ing.item_id)
                  return (
                    <TableRow key={idx}>
                      <TableCell className="align-top pt-4">
                        <Select
                          value={ing.item_id}
                          onValueChange={(val) => {
                            const n = [...ingredients]
                            n[idx].item_id = val
                            setIngredients(n)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <Input
                          type="number"
                          step="0.001"
                          value={ing.base_quantity_50}
                          onChange={(e) => {
                            const n = [...ingredients]
                            const val = e.target.value
                            n[idx].base_quantity_50 = val
                            n[idx].increment_quantity_10 = (Number(val) * 0.1).toFixed(3)
                            setIngredients(n)
                          }}
                        />
                        <div className="text-xs text-muted-foreground mt-1 h-4">
                          {getUnitHint(ing.base_quantity_50, selItem?.unit)}
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <Input
                          type="number"
                          step="0.001"
                          value={ing.increment_quantity_10}
                          onChange={(e) => {
                            const n = [...ingredients]
                            n[idx].increment_quantity_10 = e.target.value
                            setIngredients(n)
                          }}
                        />
                        <div className="text-xs text-muted-foreground mt-1 h-4">
                          {getUnitHint(ing.increment_quantity_10, selItem?.unit)}
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveIngredient(idx)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {ingredients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      Nenhum insumo incluído.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-end text-sm text-muted-foreground">
            Custo Estimado (Base 50):{' '}
            <strong className="ml-2 text-foreground text-base">
              R$ {estimatedCost.toFixed(2)}
            </strong>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
