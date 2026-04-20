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
import { MessageCircle } from 'lucide-react'

interface Props {
  lead: Partial<Lead>
  onChange: (lead: Partial<Lead>) => void
  fieldErrors?: Record<string, string>
}

export function LeadTabContato({ lead, onChange, fieldErrors = {} }: Props) {
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
          className={fieldErrors.name ? 'border-red-500' : ''}
        />
        {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Telefone</Label>
          <div className="flex gap-2">
            <Input
              value={lead.phone || ''}
              onChange={(e) => handleChange('phone', maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              className={fieldErrors.phone ? 'border-red-500' : ''}
            />
            {lead.phone && (
              <a
                href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#25D366] text-white hover:bg-[#128C7E] h-9 px-3 shrink-0 shadow-sm"
                title="Contato via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
          {fieldErrors.phone && <p className="text-xs text-red-500">{fieldErrors.phone}</p>}
        </div>
        <div className="grid gap-2">
          <Label>E-mail</Label>
          <Input
            value={lead.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            type="email"
            placeholder="email@exemplo.com"
            className={fieldErrors.email ? 'border-red-500' : ''}
          />
          {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
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
