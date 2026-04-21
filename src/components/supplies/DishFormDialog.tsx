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
import { Plus, Trash } from 'lucide-react'
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
    pb.collection('items')
      .getFullList({ filter: 'type="product"' })
      .then(setItems)
      .catch(console.error)
  }, [])

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
              base_quantity_50: i.base_quantity_50,
              increment_quantity_10: i.increment_quantity_10,
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
    setIngredients([...ingredients, { item_id: '', base_quantity_50: 0, increment_quantity_10: 0 }])
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dish ? 'Editar Prato' : 'Novo Prato'}</DialogTitle>
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
            <Label>Descrição</Label>
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
            <h3 className="text-lg font-semibold">Ficha Técnica (Insumos)</h3>
            <Button size="sm" variant="outline" onClick={handleAddIngredient}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Insumo
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead className="w-32">Qtd (50 conv.)</TableHead>
                  <TableHead className="w-32">Acréscimo (10 conv.)</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Select
                        value={ing.item_id}
                        onValueChange={(val) => {
                          const newIngs = [...ingredients]
                          newIngs[idx].item_id = val
                          setIngredients(newIngs)
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
                    <TableCell>
                      <Input
                        type="number"
                        value={ing.base_quantity_50 === 0 ? '' : ing.base_quantity_50}
                        onChange={(e) => {
                          const newIngs = [...ingredients]
                          newIngs[idx].base_quantity_50 = e.target.value
                          setIngredients(newIngs)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={ing.increment_quantity_10 === 0 ? '' : ing.increment_quantity_10}
                        onChange={(e) => {
                          const newIngs = [...ingredients]
                          newIngs[idx].increment_quantity_10 = e.target.value
                          setIngredients(newIngs)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleRemoveIngredient(idx)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {ingredients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      Nenhum insumo adicionado.
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
