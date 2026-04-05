import { useEffect, useState } from 'react'
import { getInventory, getUpcomingEvents, addMovement } from '@/services/stock'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function MovementDialog({ onMovementAdded }: { onMovementAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('entry')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [locFrom, setLocFrom] = useState('camara')
  const [locTo, setLocTo] = useState('camara')
  const [eventId, setEventId] = useState('')
  const [lot, setLot] = useState('')

  const [products, setProducts] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      getInventory().then(setProducts)
      getUpcomingEvents().then(setEvents)
      setLot(
        `LOTE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')}`,
      )
    }
  }, [open])

  const onSubmit = async () => {
    if (!productId || !quantity) return
    setLoading(true)
    const payload: any = {
      product_id: productId,
      type,
      quantity: Number(quantity),
    }
    if (type === 'entry') {
      payload.location_to = locTo
      payload.lot = lot
    } else if (type === 'exit') {
      payload.location_from = locFrom
      if (eventId && eventId !== 'none') payload.event_id = eventId
    } else if (type === 'transfer') {
      payload.location_from = locFrom
      payload.location_to = locTo
    }

    const { error } = await addMovement(payload)
    setLoading(false)
    if (!error) {
      toast({ title: 'Sucesso', description: 'Movimentação registrada com sucesso.' })
      setOpen(false)
      onMovementAdded()
      setProductId('')
      setQuantity('')
      setEventId('')
    } else {
      toast({
        title: 'Erro',
        description: 'Falha ao registrar movimentação.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nova Movimentação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Movimentação</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entrada (Produção/Compra)</SelectItem>
                <SelectItem value="exit">Saída (Evento/Perda)</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Produto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Quantidade</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>

          {(type === 'exit' || type === 'transfer') && (
            <div className="grid gap-2">
              <Label>Local de Origem</Label>
              <Select value={locFrom} onValueChange={setLocFrom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camara">Câmara Fria</SelectItem>
                  <SelectItem value="freezer">Freezer Cozinha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(type === 'entry' || type === 'transfer') && (
            <div className="grid gap-2">
              <Label>Local de Destino</Label>
              <Select value={locTo} onValueChange={setLocTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camara">Câmara Fria</SelectItem>
                  <SelectItem value="freezer">Freezer Cozinha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'entry' && (
            <div className="grid gap-2">
              <Label>Lote (Opcional)</Label>
              <Input value={lot} onChange={(e) => setLot(e.target.value)} />
            </div>
          )}

          {type === 'exit' && (
            <div className="grid gap-2">
              <Label>Evento (Opcional)</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum evento</SelectItem>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.title} - {ev.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button disabled={loading || !productId || !quantity} onClick={onSubmit}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
