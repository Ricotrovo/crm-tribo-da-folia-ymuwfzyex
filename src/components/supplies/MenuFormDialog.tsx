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
import { Plus, Trash } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { getUnitHint } from '@/lib/scaling'

export function MenuFormDialog({ open, onOpenChange, menu, onSaved }: any) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [prices, setPrices] = useState({
    wd: '',
    we: '',
    hol: '',
    extraAdv: '',
    extraDay: '',
    childFree: '',
  })

  const [menuDishes, setMenuDishes] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])

  const [allDishes, setAllDishes] = useState<any[]>([])
  const [allItems, setAllItems] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      pb.collection('dishes').getFullList().then(setAllDishes)
      pb.collection('items').getFullList().then(setAllItems)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (menu) {
        setName(menu.name)
        setPrices({
          wd: menu.price_weekday?.toString() || '',
          we: menu.price_weekend?.toString() || '',
          hol: menu.price_holiday?.toString() || '',
          extraAdv: menu.extra_guest_price_advance?.toString() || '',
          extraDay: menu.extra_guest_price_day_of?.toString() || '',
          childFree: menu.child_free_age_limit?.toString() || '',
        })

        pb.collection('menu_dishes')
          .getFullList({ filter: `menu_id="${menu.id}"`, expand: 'dish_id' })
          .then((res) => setMenuDishes(res.map((r) => ({ id: r.id, dish_id: r.dish_id }))))

        pb.collection('menu_items')
          .getFullList({ filter: `menu_id="${menu.id}"`, expand: 'item_id' })
          .then((res) =>
            setMenuItems(res.map((r) => ({ id: r.id, item_id: r.item_id, quantity: r.quantity }))),
          )
      } else {
        setName('')
        setPrices({ wd: '', we: '', hol: '', extraAdv: '', extraDay: '', childFree: '' })
        setMenuDishes([])
        setMenuItems([])
      }
    }
  }, [open, menu])

  const handleSave = async () => {
    if (!name) return toast({ title: 'Nome é obrigatório', variant: 'destructive' })
    if (menuDishes.some((d) => !d.dish_id) || menuItems.some((i) => !i.item_id))
      return toast({ title: 'Selecione pratos/itens válidos', variant: 'destructive' })

    setLoading(true)
    try {
      const data = {
        name,
        price_weekday: Number(prices.wd) || 0,
        price_weekend: Number(prices.we) || 0,
        price_holiday: Number(prices.hol) || 0,
        child_free_age_limit: Number(prices.childFree) || 0,
        extra_guest_price_advance: Number(prices.extraAdv) || 0,
        extra_guest_price_day_of: Number(prices.extraDay) || 0,
      }

      let mId = menu?.id
      if (mId) await pb.collection('menus').update(mId, data)
      else mId = (await pb.collection('menus').create(data)).id

      const existingDishes = menu
        ? await pb.collection('menu_dishes').getFullList({ filter: `menu_id="${mId}"` })
        : []
      const existingDIds = existingDishes.map((ed) => ed.id)
      for (const d of menuDishes) {
        if (d.id) {
          const idx = existingDIds.indexOf(d.id)
          if (idx > -1) existingDIds.splice(idx, 1)
        } else {
          await pb.collection('menu_dishes').create({ menu_id: mId, dish_id: d.dish_id })
        }
      }
      for (const id of existingDIds) await pb.collection('menu_dishes').delete(id)

      const existingItems = menu
        ? await pb.collection('menu_items').getFullList({ filter: `menu_id="${mId}"` })
        : []
      const existingIIds = existingItems.map((ei) => ei.id)
      for (const i of menuItems) {
        const payload = { menu_id: mId, item_id: i.item_id, quantity: Number(i.quantity) || 0 }
        if (i.id) {
          await pb.collection('menu_items').update(i.id, payload)
          const idx = existingIIds.indexOf(i.id)
          if (idx > -1) existingIIds.splice(idx, 1)
        } else {
          await pb.collection('menu_items').create(payload)
        }
      }
      for (const id of existingIIds) await pb.collection('menu_items').delete(id)

      toast({ title: 'Cardápio salvo com sucesso!' })
      onSaved()
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{menu ? 'Alterar Cardápio' : 'Incluir Cardápio'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 col-span-3">
            <Label>Nome do Pacote</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Preço Base (Sáb/Dom/Feriado)</Label>
            <Input
              type="number"
              step="0.01"
              value={prices.we}
              onChange={(e) => {
                const val = e.target.value
                const num = Number(val)
                if (name.toLowerCase() === 'escolar') {
                  setPrices({
                    ...prices,
                    we: val,
                    wd: val,
                    hol: val,
                  })
                } else {
                  setPrices({
                    ...prices,
                    we: val,
                    wd: num ? Math.max(0, num - 1500).toString() : '',
                    hol: num ? Math.max(0, num - 500).toString() : '',
                  })
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Preço (Segunda a Quinta)</Label>
            <Input
              type="number"
              step="0.01"
              value={prices.wd}
              onChange={(e) => setPrices({ ...prices, wd: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Preço (Sexta / Véspera)</Label>
            <Input
              type="number"
              step="0.01"
              value={prices.hol}
              onChange={(e) => setPrices({ ...prices, hol: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Idade Isenta (Anos)</Label>
            <Input
              type="number"
              value={prices.childFree}
              onChange={(e) => setPrices({ ...prices, childFree: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Valor Excedente Antecipado (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={prices.extraAdv}
              onChange={(e) => setPrices({ ...prices, extraAdv: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Valor Excedente no Dia (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={prices.extraDay}
              onChange={(e) => setPrices({ ...prices, extraDay: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Pratos Inclusos</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMenuDishes([...menuDishes, { dish_id: '' }])}
              >
                <Plus className="w-4 h-4 mr-2" /> Incluir Prato
              </Button>
            </div>
            {menuDishes.map((md, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <Select
                  value={md.dish_id}
                  onValueChange={(v) => {
                    const n = [...menuDishes]
                    n[idx].dish_id = v
                    setMenuDishes(n)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allDishes.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    const n = [...menuDishes]
                    n.splice(idx, 1)
                    setMenuDishes(n)
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Itens e Serviços Extras</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMenuItems([...menuItems, { item_id: '', quantity: 1 }])}
              >
                <Plus className="w-4 h-4 mr-2" /> Incluir Item
              </Button>
            </div>
            {menuItems.map((mi, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-start">
                <div className="flex-1">
                  <Select
                    value={mi.item_id}
                    onValueChange={(v) => {
                      const n = [...menuItems]
                      n[idx].item_id = v
                      setMenuItems(n)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allItems.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.name} ({i.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    step="0.001"
                    value={mi.quantity}
                    onChange={(e) => {
                      const n = [...menuItems]
                      n[idx].quantity = e.target.value
                      setMenuItems(n)
                    }}
                  />
                  <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
                    {getUnitHint(mi.quantity, allItems.find((x) => x.id === mi.item_id)?.unit)}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    const n = [...menuItems]
                    n.splice(idx, 1)
                    setMenuItems(n)
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Salvar Cardápio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
