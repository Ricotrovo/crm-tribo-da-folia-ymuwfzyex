import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Lead } from '@/services/leads'
import { maskPhone } from '@/lib/formatters'

interface Props {
  lead: Partial<Lead>
  onChange: (lead: Partial<Lead>) => void
}

export function LeadTabContato({ lead, onChange }: Props) {
  const handleChange = (field: keyof Lead, value: string) => {
    onChange({ ...lead, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          value={lead.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Nome completo"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Telefone</Label>
          <Input
            value={lead.phone || ''}
            onChange={(e) => handleChange('phone', maskPhone(e.target.value))}
            placeholder="(00) 00000-0000"
          />
        </div>
        <div className="grid gap-2">
          <Label>E-mail</Label>
          <Input
            value={lead.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            type="email"
            placeholder="email@exemplo.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Instagram</Label>
          <Input
            value={lead.instagram || ''}
            onChange={(e) => handleChange('instagram', e.target.value)}
            placeholder="@usuario"
          />
        </div>
        <div className="grid gap-2">
          <Label>Origem</Label>
          <Input
            value={lead.origin || ''}
            onChange={(e) => handleChange('origin', e.target.value)}
            placeholder="Ex: Indicação, Google, Instagram..."
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Estágio no Funil</Label>
          <Select value={lead.status || 'Novo'} onValueChange={(v) => handleChange('status', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Novo">Novo</SelectItem>
              <SelectItem value="Contato Inicial">Contato Inicial</SelectItem>
              <SelectItem value="Proposta">Proposta</SelectItem>
              <SelectItem value="Visita">Visita</SelectItem>
              <SelectItem value="Fechado">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Temperatura</Label>
          <Select
            value={lead.temperature || ''}
            onValueChange={(v) => handleChange('temperature', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Quente">Quente 🔴</SelectItem>
              <SelectItem value="Morno">Morno 🟠</SelectItem>
              <SelectItem value="Frio">Frio 🔵</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Indicação de quem?</Label>
        <Input
          value={lead.referral_info || ''}
          onChange={(e) => handleChange('referral_info', e.target.value)}
          placeholder="Nome de quem indicou"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-muted/40 p-4 rounded-lg border border-border/50">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_existing_client"
            checked={!!lead.is_existing_client}
            onCheckedChange={(c) => handleChange('is_existing_client', c)}
          />
          <Label htmlFor="is_existing_client">Já é cliente?</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="has_previous_events"
            checked={!!lead.has_previous_events}
            onCheckedChange={(c) => handleChange('has_previous_events', c)}
          />
          <Label htmlFor="has_previous_events">Já fez evento conosco?</Label>
        </div>
      </div>
    </div>
  )
}
