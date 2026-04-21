import { useState, useEffect } from 'react'
import { Plus, Trash } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getEventDishes,
  createEventDish,
  deleteEventDish,
  getDishes,
  getDishIngredients,
} from '@/services/dishes'

export function EventDishesSection({
  eventId,
  guestCount,
}: {
  eventId: string
  guestCount: number
}) {
  const [eventDishes, setEventDishes] = useState<any[]>([])
  const [allDishes, setAllDishes] = useState<any[]>([])
  const [selectedDish, setSelectedDish] = useState<string>('')
  const [ingredientsNeed, setIngredientsNeed] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      const [evDishes, dishes] = await Promise.all([getEventDishes(eventId), getDishes()])
      setEventDishes(evDishes)
      setAllDishes(dishes)

      const dishIds = evDishes.map((ed: any) => ed.dish_id)
      const needs = new Map<string, any>()

      for (const dId of dishIds) {
        const ings = await getDishIngredients(dId)
        for (const ing of ings) {
          const item = ing.expand?.item_id
          if (!item) continue

          let qty = Number(ing.base_quantity_50) || 0
          if (guestCount > 50) {
            const extraBlocks = Math.ceil((guestCount - 50) / 10)
            qty += extraBlocks * (Number(ing.increment_quantity_10) || 0)
          }

          if (needs.has(item.id)) {
            needs.get(item.id).qty += qty
          } else {
            needs.set(item.id, {
              item_name: item.name,
              unit: item.unit,
              qty: qty,
            })
          }
        }
      }

      setIngredientsNeed(Array.from(needs.values()))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [eventId, guestCount])

  const handleAddDish = async () => {
    if (!selectedDish) return
    setLoading(true)
    try {
      await createEventDish({ event_id: eventId, dish_id: selectedDish })
      setSelectedDish('')
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDish = async (id: string) => {
    setLoading(true)
    try {
      await deleteEventDish(id)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const availableDishes = allDishes.filter((d) => !eventDishes.some((ed) => ed.dish_id === d.id))

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <h3 className="text-xl font-bold">Cardápio do Evento</h3>
          <div className="flex items-center gap-2">
            <Select value={selectedDish} onValueChange={setSelectedDish}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um prato..." />
              </SelectTrigger>
              <SelectContent>
                {availableDishes.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddDish} disabled={!selectedDish || loading}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prato</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventDishes.map((ed) => (
                <TableRow key={ed.id}>
                  <TableCell className="font-medium">{ed.expand?.dish_id?.name}</TableCell>
                  <TableCell>{ed.expand?.dish_id?.category}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleRemoveDish(ed.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {eventDishes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    Nenhum prato adicionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-muted/20 p-6 rounded-lg border">
        <h3 className="text-lg font-bold mb-2">Necessidade de Insumos (Shopping List)</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Calculado com base em <strong>{guestCount} convidados</strong> para os pratos selecionados
          no cardápio.
        </p>

        {ingredientsNeed.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 bg-card rounded border border-dashed">
            Adicione pratos ao cardápio para calcular a lista de insumos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ingredientsNeed.map((need, i) => (
              <div
                key={i}
                className="flex flex-col justify-center bg-card p-4 rounded-md border shadow-sm"
              >
                <span className="font-medium text-sm mb-1 line-clamp-1" title={need.item_name}>
                  {need.item_name}
                </span>
                <span className="text-lg font-bold text-primary">
                  {Number(need.qty).toFixed(2)}{' '}
                  <span className="text-sm font-normal text-muted-foreground">{need.unit}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
