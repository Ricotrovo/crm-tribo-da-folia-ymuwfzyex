import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MessageCircle,
  Bot,
  User,
  Send,
  Phone,
  Instagram,
  Facebook,
  Sparkles,
  Plus,
} from 'lucide-react'
import { NewLeadDialog } from '@/components/leads/NewLeadDialog'
import { useToast } from '@/hooks/use-toast'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  getLeads,
  updateLeadStatus,
  getConversations,
  sendMessage,
  getAIResponse,
  createLead,
  Lead,
  Conversation,
} from '@/services/leads'
import { supabase } from '@/lib/supabase/client'

const STAGES = ['Novo', 'Contato Inicial', 'Proposta', 'Visita', 'Fechado'] as const

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadLeads()

    const channel = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        loadLeads()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (selectedLead) {
      loadConversations(selectedLead.id)
    }
  }, [selectedLead])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [conversations, isChatLoading])

  const loadLeads = async () => {
    try {
      const data = await getLeads()
      if (data) setLeads(data)
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao carregar leads.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadConversations = async (leadId: string) => {
    setIsChatLoading(true)
    try {
      const data = await getConversations(leadId)
      if (data) setConversations(data)
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao carregar conversas.',
        variant: 'destructive',
      })
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id)
    setDraggingId(id)
  }

  const handleDragEnd = () => setDraggingId(null)

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setDraggingId(null)
    const leadId = e.dataTransfer.getData('leadId')

    if (leadId) {
      const lead = leads.find((l) => l.id === leadId)
      if (!lead || lead.status === newStatus) return

      setLeads((current) => current.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)))

      try {
        await updateLeadStatus(leadId, newStatus)
        toast({ title: 'Sucesso', description: `${lead.name} movido para ${newStatus}` })

        if (newStatus === 'Proposta' || newStatus === 'Fechado') {
          toast({
            title: 'Dica da IA 🤖',
            description: `Que tal gerar um contrato para ${lead.name} agora em 'Contratos'?`,
          })
        }
      } catch (err) {
        toast({ title: 'Erro', description: 'Falha ao mover lead.', variant: 'destructive' })
        setLeads((current) =>
          current.map((l) => (l.id === leadId ? { ...l, status: lead.status } : l)),
        )
      }
    }
  }

  const handleSendMessage = async (isClient: boolean = false) => {
    if (!selectedLead || !messageInput.trim()) return
    const msg = messageInput.trim()
    setMessageInput('')
    setIsChatLoading(true)

    try {
      if (isClient) {
        const clientMsg = await sendMessage(selectedLead.id, msg, 'client')
        if (clientMsg) setConversations((prev) => [...prev, clientMsg])

        const aiMsg = await getAIResponse(selectedLead.id, msg)
        if (aiMsg) setConversations((prev) => [...prev, aiMsg])
      } else {
        const sellerMsg = await sendMessage(selectedLead.id, msg, 'seller')
        if (sellerMsg) setConversations((prev) => [...prev, sellerMsg])
      }
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err)
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao enviar mensagem.',
        variant: 'destructive',
      })
    } finally {
      setIsChatLoading(false)
    }
  }

  const getOriginIcon = (origin?: string | null) => {
    if (!origin) return <MessageCircle className="h-3 w-3" />
    switch (origin.toLowerCase()) {
      case 'whatsapp':
        return <Phone className="h-3 w-3 text-green-500" />
      case 'instagram':
        return <Instagram className="h-3 w-3 text-pink-500" />
      case 'facebook':
        return <Facebook className="h-3 w-3 text-blue-500" />
      default:
        return <MessageCircle className="h-3 w-3" />
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Funil de Vendas + IA</h2>
          <p className="text-muted-foreground">
            Gerencie seus leads e deixe a IA atender automaticamente.
          </p>
        </div>
        <Button onClick={() => setIsNewLeadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Lead
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
        {STAGES.map((stage) => {
          const columnLeads = leads.filter((l) => l && l.status === stage)
          return (
            <div
              key={stage}
              className={cn(
                'flex flex-col bg-muted/40 rounded-xl p-3 min-w-[260px] border transition-colors h-full max-h-[calc(100vh-12rem)]',
                draggingId ? 'border-primary/20 bg-muted/60' : 'border-transparent',
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                  {stage}
                </h3>
                <Badge variant="secondary" className="rounded-full">
                  {columnLeads.length}
                </Badge>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-2">
                {loading ? (
                  <>
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </>
                ) : (
                  columnLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedLead(lead)}
                      className={cn(
                        'cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm',
                        draggingId === lead.id ? 'opacity-50' : 'opacity-100',
                      )}
                    >
                      <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {lead.name}
                        </CardTitle>
                        <div title={lead.origin || 'Desconhecida'}>
                          {getOriginIcon(lead.origin)}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background">
                            {lead.origin || 'Desconhecida'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                {!loading && columnLeads.length === 0 && (
                  <div className="text-center p-4 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground">
                    Arraste leads para cá
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="sm:max-w-md w-full flex flex-col p-0 border-l">
          <div className="p-6 pb-4 border-b bg-background z-10">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-xl">
                {selectedLead?.name}
                <Badge variant="secondary" className="text-xs font-normal">
                  {selectedLead?.status}
                </Badge>
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1.5 font-medium">
                {selectedLead && getOriginIcon(selectedLead.origin)}
                <span>
                  {selectedLead?.origin || 'Desconhecida'} • {selectedLead?.phone || 'Sem telefone'}
                </span>
              </SheetDescription>
            </SheetHeader>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-muted/10"
          >
            {conversations.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex max-w-[85%] rounded-xl p-3 text-sm shadow-sm',
                  msg.sender === 'client'
                    ? 'bg-background border self-start rounded-tl-sm'
                    : msg.sender === 'ai'
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-100 self-start rounded-tl-sm border-purple-200 dark:border-purple-800'
                      : 'bg-primary text-primary-foreground self-end rounded-tr-sm',
                )}
              >
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex items-center gap-1.5 text-[10px] opacity-80 mb-0.5">
                    {msg.sender === 'client' && <User className="h-3 w-3" />}
                    {msg.sender === 'ai' && <Bot className="h-3 w-3" />}
                    {msg.sender === 'seller' && <Sparkles className="h-3 w-3" />}
                    <span className="font-semibold uppercase tracking-wider">
                      {msg.sender === 'ai'
                        ? 'IA Assistente'
                        : msg.sender === 'client'
                          ? 'Cliente'
                          : 'Você'}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap text-[13px]">{msg.message}</p>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex max-w-[80%] rounded-xl p-3 text-sm bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-100 self-start rounded-tl-sm">
                <div className="flex items-center gap-2 opacity-80">
                  <Bot className="h-4 w-4 animate-pulse" />
                  <span className="animate-pulse font-medium text-[13px]">
                    IA analisando e digitando...
                  </span>
                </div>
              </div>
            )}

            {conversations.length > 0 && selectedLead?.status !== 'Fechado' && (
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 mt-4 text-sm flex gap-3 items-start shadow-sm">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">
                    Dica de Atendimento Automático
                  </p>
                  <p className="text-blue-800/90 dark:text-blue-300/90 text-[13px] leading-relaxed">
                    Com base no histórico, sugerimos enviar uma proposta formalizada ou convidar o
                    cliente para uma visita presencial aos nossos salões.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-background flex flex-col gap-3 z-10">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Responda manualmente ao cliente..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(false)
                  }
                }}
                disabled={isChatLoading}
                className="bg-muted/50 focus-visible:bg-background h-10"
              />
              <Button
                onClick={() => handleSendMessage(false)}
                disabled={!messageInput.trim() || isChatLoading}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
              <div className="flex items-center gap-1.5">
                <Bot className="h-3 w-3" />
                <span>A IA responderá apenas as mensagens simuladas.</span>
              </div>
              <button
                onClick={() => handleSendMessage(true)}
                disabled={!messageInput.trim() || isChatLoading}
                className="text-purple-600 hover:text-purple-700 font-semibold disabled:opacity-50 transition-colors"
                title="Use isso para testar a resposta automática da IA"
              >
                Simular cliente enviando (IA)
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <NewLeadDialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen} onSuccess={loadLeads} />
    </div>
  )
}
