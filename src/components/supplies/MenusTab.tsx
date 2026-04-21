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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { MenuFormDialog } from './MenuFormDialog'

export function MenusTab() {
  const [menus, setMenus] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const data = await pb.collection('menus').getFullList({ sort: 'name' })
      setMenus(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('menus', () => loadData())

  const handleEdit = (m: any) => {
    setEditingMenu(m)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este cardápio? Isso não afetará os eventos, mas removerá o modelo.'))
      return
    try {
      await pb.collection('menus').delete(id)
      toast({ title: 'Sucesso', description: 'Cardápio excluído.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pacotes / Cardápios</h2>
        <Button
          onClick={() => {
            setEditingMenu(null)
            setOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Incluir Cardápio
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Base (Sáb/Dom/Feriado)</TableHead>
            <TableHead>Segunda a Quinta</TableHead>
            <TableHead>Sexta / Véspera</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menus.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell>R$ {(m.price_weekend || 0).toFixed(2)}</TableCell>
              <TableCell>R$ {(m.price_weekday || 0).toFixed(2)}</TableCell>
              <TableCell>R$ {(m.price_holiday || 0).toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(m)}>
                    <Pencil className="h-4 w-4 mr-1" /> Alterar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {menus.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                Nenhum cardápio cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <MenuFormDialog open={open} onOpenChange={setOpen} menu={editingMenu} onSaved={loadData} />
    </div>
  )
}
