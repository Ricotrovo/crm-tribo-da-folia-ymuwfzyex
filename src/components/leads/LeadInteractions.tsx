import { useEffect, useState } from 'react'
import { Interaction, getInteractions, createInteraction } from '@/services/leads'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { Calendar, MessageSquare, Phone, User, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export function LeadInteractions({ leadId }: { leadId: string }) {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('Call')
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState('Neutral')
  const { toast } = useToast()

  const loadInteractions = async () => {
    try {
      const data = await getInteractions(leadId)
      setInteractions(data)
    } catch (error) {
      console.error('Failed to load interactions:', error)
    }
  }

  useEffect(() => {
    loadInteractions()
  }, [leadId])

  useRealtime('interactions', () => {
    loadInteractions()
  })

  const handleAddInteraction = async () => {
    if (!notes) return
    setLoading(true)
    try {
      await createInteraction({
        lead_id: leadId,
        type,
        notes,
        feedback,
        interaction_date: new Date().toISOString(),
      })
      setNotes('')
      setType('Call')
      setFeedback('Neutral')
      toast({ title: 'Interação registrada com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao registrar interação',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'Visit':
        return <User className="w-4 h-4 text-blue-500" />
      case 'Tasting':
        return <Calendar className="w-4 h-4 text-orange-500" />
      case 'Call':
        return <Phone className="w-4 h-4 text-green-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  const getFeedbackIcon = (feedback: string) => {
    switch (feedback) {
      case 'Positive':
        return <ThumbsUp className="w-4 h-4 text-green-500" />
      case 'Negative':
        return <ThumbsDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 border border-border/50 p-4 rounded-lg space-y-4">
        <h4 className="font-semibold text-sm">Nova Interação</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Call">Ligação</SelectItem>
                <SelectItem value="Message">Mensagem</SelectItem>
                <SelectItem value="Visit">Visita</SelectItem>
                <SelectItem value="Tasting">Degustação</SelectItem>
                <SelectItem value="Negotiation">Negociação</SelectItem>
                <SelectItem value="Other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sentimento / Feedback</Label>
            <Select value={feedback} onValueChange={setFeedback}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Positive">Positivo</SelectItem>
                <SelectItem value="Neutral">Neutro</SelectItem>
                <SelectItem value="Negative">Negativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Anotações</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalhes da conversa, preferências do cliente..."
            className="resize-none"
            rows={3}
          />
        </div>
        <Button type="button" onClick={handleAddInteraction} disabled={loading || !notes}>
          {loading ? 'Salvando...' : 'Registrar Interação'}
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm">Linha do Tempo</h4>
        {interactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma interação registrada.</p>
        ) : (
          <div className="relative border-l border-border/50 ml-3 space-y-6 pb-4">
            {interactions.map((int) => (
              <div key={int.id} className="relative pl-6 animate-fade-in-up">
                <div className="absolute -left-3.5 bg-background border rounded-full p-1.5 shadow-sm">
                  {getIcon(int.type)}
                </div>
                <div className="bg-card border rounded-lg p-3 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-muted-foreground">
                      {format(new Date(int.interaction_date), "dd/MM/yyyy 'às' HH:mm")}
                    </span>
                    {getFeedbackIcon(int.feedback)}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{int.notes}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
