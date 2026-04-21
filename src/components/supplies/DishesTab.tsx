import { useState, useEffect } from 'react'
import { Plus, Edit, Trash, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getDishes, deleteDish } from '@/services/dishes'
import { DishFormDialog } from './DishFormDialog'
import { useToast } from '@/hooks/use-toast'

export function DishesTab() {
  const [dishes, setDishes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDish, setEditingDish] = useState<any>(null)
  const { toast } = useToast()

  const loadData = () => {
    getDishes().then(setDishes).catch(console.error)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return
    try {
      await deleteDish(id)
      toast({ title: 'Prato excluído com sucesso!' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const filtered = dishes.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pratos..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setEditingDish(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Incluir Prato
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Opcional</TableHead>
              <TableHead>Preço Venda (Opcional)</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((dish) => (
              <TableRow key={dish.id}>
                <TableCell className="font-medium">{dish.name}</TableCell>
                <TableCell>{dish.category}</TableCell>
                <TableCell>
                  {dish.is_optional ? <Badge>Sim</Badge> : <Badge variant="outline">Não</Badge>}
                </TableCell>
                <TableCell>
                  {dish.is_optional && dish.base_sale_price
                    ? `R$ ${dish.base_sale_price.toFixed(2)}`
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingDish(dish)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Alterar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(dish.id)}>
                      <Trash className="w-4 h-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </TableCell>{' '}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhum prato encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DishFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        dish={editingDish}
        onSaved={loadData}
      />
    </div>
  )
}
