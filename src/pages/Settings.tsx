import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExecutiveDashboard } from '@/components/reports/ExecutiveDashboard'
import { SalesReport } from '@/components/reports/SalesReport'
import { EventsReport } from '@/components/reports/EventsReport'
import { FinancialReport } from '@/components/reports/FinancialReport'
import { StockReport } from '@/components/reports/StockReport'
import { FreelancersReport } from '@/components/reports/FreelancersReport'

export default function Settings() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Relatórios e Dashboards</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe as métricas e o desempenho do seu negócio em tempo real.
        </p>
      </div>

      <Tabs defaultValue="executive" className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full justify-start bg-transparent p-0 gap-2 mb-6">
          <TabsTrigger
            value="executive"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 border border-transparent data-[state=inactive]:border-border data-[state=inactive]:bg-background"
          >
            Resumo Executivo
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 border border-transparent data-[state=inactive]:border-border data-[state=inactive]:bg-background"
          >
            Vendas
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 border border-transparent data-[state=inactive]:border-border data-[state=inactive]:bg-background"
          >
            Eventos
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 border border-transparent data-[state=inactive]:border-border data-[state=inactive]:bg-background"
          >
            Financeiro
          </TabsTrigger>
          <TabsTrigger
            value="stock"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 border border-transparent data-[state=inactive]:border-border data-[state=inactive]:bg-background"
          >
            Estoque
          </TabsTrigger>
          <TabsTrigger
            value="freelancers"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 border border-transparent data-[state=inactive]:border-border data-[state=inactive]:bg-background"
          >
            Freelancers
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="executive" className="mt-0 border-none outline-none">
            <ExecutiveDashboard />
          </TabsContent>
          <TabsContent value="sales" className="mt-0 border-none outline-none">
            <SalesReport />
          </TabsContent>
          <TabsContent value="events" className="mt-0 border-none outline-none">
            <EventsReport />
          </TabsContent>
          <TabsContent value="financial" className="mt-0 border-none outline-none">
            <FinancialReport />
          </TabsContent>
          <TabsContent value="stock" className="mt-0 border-none outline-none">
            <StockReport />
          </TabsContent>
          <TabsContent value="freelancers" className="mt-0 border-none outline-none">
            <FreelancersReport />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
