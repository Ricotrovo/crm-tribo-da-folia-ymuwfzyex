import { useState } from 'react'
import { mockLeads, Lead } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, MessageCircle, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const STAGES = ['Contact', 'Visit', 'Negotiation', 'Closed'] as const

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const { toast } = useToast()

  const moveLead = (id: string, forward: boolean) => {
    setLeads((current) =>
      current.map((lead) => {
        if (lead.id === id) {
          const currentIndex = STAGES.indexOf(lead.status)
          const newIndex = forward
            ? Math.min(currentIndex + 1, STAGES.length - 1)
            : Math.max(currentIndex - 1, 0)
          const newStatus = STAGES[newIndex]

          if (newStatus !== lead.status) {
            toast({ title: 'Lead Updated', description: `${lead.name} moved to ${newStatus}` })
          }
          return { ...lead, status: newStatus }
        }
        return lead
      }),
    )
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leads Funnel</h2>
          <p className="text-muted-foreground">Manage your potential clients and pipeline.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Lead
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const columnLeads = leads.filter((l) => l.status === stage)
          return (
            <div key={stage} className="flex flex-col bg-muted/50 rounded-xl p-4 min-w-[280px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                  {stage}
                </h3>
                <Badge variant="secondary" className="rounded-full">
                  {columnLeads.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-3">
                {columnLeads.map((lead) => (
                  <Card
                    key={lead.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
                  >
                    <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between">
                      <CardTitle className="text-sm font-medium leading-tight">
                        {lead.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 flex flex-col gap-3">
                      <div className="text-sm font-semibold text-emerald-600">
                        R$ {lead.value.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{lead.date}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="WhatsApp">
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                          {stage !== 'Closed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                              onClick={() => moveLead(lead.id, true)}
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {columnLeads.length === 0 && (
                  <div className="text-center p-4 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground">
                    No leads here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
