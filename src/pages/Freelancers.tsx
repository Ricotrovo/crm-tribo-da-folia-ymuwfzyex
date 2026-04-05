import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Phone, Mail, UserPlus, Settings2, CalendarCheck, Star, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { FreelancerSheet } from '@/components/freelancers/FreelancerSheet'
import { AssignmentSheet } from '@/components/freelancers/AssignmentSheet'

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFreelancerOpen, setIsFreelancerOpen] = useState(false)
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)

    const { data: freelancersData } = await supabase
      .from('freelancers' as any)
      .select('*, freelancer_roles(*)')

    const { data: assignmentsData } = await supabase
      .from('event_assignments' as any)
      .select('*, events(title, date), freelancers(name)')

    setFreelancers(freelancersData || [])
    setAssignments(assignmentsData || [])
    setLoading(false)
  }

  useEffect(() => {
      setLoading(true)

      const { data: freelancersData } = await supabase
        .from('freelancers' as any)
        .select('*, freelancer_roles(*)')

      const { data: assignmentsData } = await supabase
        .from('event_assignments' as any)
        .select('*, events(title, date), freelancers(name)')

      setFreelancers(freelancersData || [])
      setAssignments(assignmentsData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipe & Freelancers</h2>
          <p className="text-muted-foreground">
            Gerencie sua equipe de apoio, escalas e pagamentos.
          </p>
        </div>
        <Button onClick={() => setIsFreelancerOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Novo Freelancer
        </Button>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger
            value="directory"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Diretório
          </TabsTrigger>
          <TabsTrigger
            value="scale"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Escala de Eventos
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Desempenho
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : freelancers.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Nenhum freelancer cadastrado.
              </div>
            ) : (
              freelancers.map((staff) => (
                <Card
                  key={staff.id}
                  className="overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://img.usecurling.com/ppl/medium?seed=${staff.id}`}
                          alt={staff.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-background shadow-sm"
                        />
                        <div>
                          <CardTitle className="text-base leading-tight">{staff.name}</CardTitle>
                          <Badge variant="outline" className="mt-1 font-normal text-xs px-1.5 py-0">
                            {staff.freelancer_roles?.[0]?.role || 'Equipe'}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={staff.status === 'Ativo' ? 'default' : 'secondary'}>
                        {staff.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{staff.phone || 'Sem telefone'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{staff.email || 'Sem e-mail'}</span>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Ver Perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="scale" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Escalas Recentes</CardTitle>
                <CardDescription>
                  Acompanhe os freelancers escalados para os próximos eventos.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsAssignmentOpen(true)}>
                <CalendarCheck className="mr-2 h-4 w-4" /> Nova Escala
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Freelancer</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma escala registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.events?.title || 'Evento'}
                        </TableCell>
                        <TableCell>
                          {assignment.events?.date
                            ? format(new Date(assignment.events.date), 'dd/MM/yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>{assignment.freelancers?.name || 'Freelancer'}</TableCell>
                        <TableCell>{assignment.role}</TableCell>
                        <TableCell>
                          <Badge
                            variant={assignment.status === 'Confirmado' ? 'default' : 'secondary'}
                          >
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Índice de Desempenho</CardTitle>
              <CardDescription>Score baseado em taxa de aceite e comparecimento.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {freelancers.map((staff, i) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {i + 1}º
                      </div>
                      <div>
                        <div className="font-medium">{staff.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <Award className="h-3 w-3 mr-1 text-amber-500" />
                          Top Performer
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center hidden sm:block">
                        <div className="text-sm font-semibold text-emerald-500">100%</div>
                        <div className="text-xs text-muted-foreground">Presença</div>
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="text-sm font-semibold text-blue-500">95%</div>
                        <div className="text-xs text-muted-foreground">Aceite</div>
                      </div>
                      <div className="text-right flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-lg">9.8</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FreelancerSheet 
        open={isFreelancerOpen} 
        onOpenChange={setIsFreelancerOpen} 
        onSuccess={() => {
          setIsFreelancerOpen(false)
          fetchData()
        }} 
      />
      <AssignmentSheet 
        open={isAssignmentOpen} 
        onOpenChange={setIsAssignmentOpen} 
        onSuccess={() => {
          setIsAssignmentOpen(false)
          fetchData()
        }} 
      />
    </div>
  )
}
