import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ItemsTab } from '@/components/supplies/ItemsTab'
import { SuppliersTab } from '@/components/supplies/SuppliersTab'
import { CategoriesTab } from '@/components/supplies/CategoriesTab'

export default function Supplies() {
  return (
    <div className="flex flex-col p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suprimentos e Serviços</h1>
        <p className="text-muted-foreground">
          Gerencie produtos, serviços, categorias e fornecedores para uso nos eventos.
        </p>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Itens e Serviços</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <ItemsTab />
          </div>
        </TabsContent>
        <TabsContent value="suppliers">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <SuppliersTab />
          </div>
        </TabsContent>
        <TabsContent value="categories">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <CategoriesTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
