import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ItemsTab } from '@/components/supplies/ItemsTab'
import { SuppliersTab } from '@/components/supplies/SuppliersTab'
import { CategoriesTab } from '@/components/supplies/CategoriesTab'
import { DishesTab } from '@/components/supplies/DishesTab'
import { MenusTab } from '@/components/supplies/MenusTab'
import { PurchaseForecastTab } from '@/components/supplies/PurchaseForecastTab'

export default function Supplies() {
  return (
    <div className="flex flex-col p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suprimentos e Serviços</h1>
        <p className="text-muted-foreground">
          Gerencie produtos, serviços, pratos, cardápios e preveja compras.
        </p>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="flex flex-wrap w-full h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="items" className="flex-1">
            Itens
          </TabsTrigger>
          <TabsTrigger value="dishes" className="flex-1">
            Pratos
          </TabsTrigger>
          <TabsTrigger value="menus" className="flex-1">
            Cardápios
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex-1">
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex-1">
            Categorias
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex-1 text-primary font-semibold">
            Previsão
          </TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <ItemsTab />
          </div>
        </TabsContent>
        <TabsContent value="dishes">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <DishesTab />
          </div>
        </TabsContent>
        <TabsContent value="menus">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <MenusTab />
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
        <TabsContent value="forecast">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <PurchaseForecastTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
