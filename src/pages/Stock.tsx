import { mockStock } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, AlertTriangle } from 'lucide-react'

export default function Stock() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage supplies and stock alerts.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900 rounded-full text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                Items Below Minimum
              </p>
              <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                {mockStock.filter((s) => s.qty < s.minQty).length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Current Stock</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search items..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Min. Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStock.map((item) => {
                const isLow = item.qty < item.minQty
                return (
                  <TableRow
                    key={item.id}
                    className={isLow ? 'bg-rose-50/50 dark:bg-rose-950/10' : ''}
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="font-mono">{item.qty}</TableCell>
                    <TableCell className="text-muted-foreground">{item.minQty}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="destructive" className="flex w-fit items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Low Stock
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 hover:bg-emerald-200"
                        >
                          Adequate
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
