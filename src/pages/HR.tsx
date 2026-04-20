import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeesTab } from '@/components/hr/EmployeesTab'
import { FreelancersTab } from '@/components/hr/FreelancersTab'

export default function HR() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestão Humana</h2>
        <p className="text-muted-foreground mt-1">Gerencie funcionários fixos e equipe de apoio.</p>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full sm:w-auto grid-cols-2 max-w-sm mb-4">
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="mt-0">
          <EmployeesTab />
        </TabsContent>
        <TabsContent value="freelancers" className="mt-0">
          <FreelancersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
