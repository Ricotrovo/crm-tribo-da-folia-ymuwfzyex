import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Lead } from '@/services/leads'
import { maskCPF, maskRG, maskCEP, validateCPF } from '@/lib/formatters'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  lead: Partial<Lead>
  onChange: (lead: Partial<Lead>) => void
}

export function LeadTabContratos({ lead, onChange }: Props) {
  const [cepLoading, setCepLoading] = useState(false)

  const handleChange = (field: keyof Lead, value: string) => {
    onChange({ ...lead, [field]: value })
  }

  const handleCepChange = async (val: string) => {
    const masked = maskCEP(val)
    handleChange('address_zip', masked)

    const unmasked = masked.replace(/\D/g, '')
    if (unmasked.length === 8) {
      setCepLoading(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${unmasked}/json/`)
        const data = await res.json()
        if (!data.erro) {
          onChange({
            ...lead,
            address_zip: masked,
            address_street: data.logradouro || lead.address_street,
            address_neighborhood: data.bairro || lead.address_neighborhood,
            address_city: data.localidade || lead.address_city,
            address_state: data.uf || lead.address_state,
          })
        }
      } catch (e) {
        console.error('CEP fetch error', e)
      } finally {
        setCepLoading(false)
      }
    }
  }

  const isCpfValid = !lead.cpf || validateCPF(lead.cpf)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label className={cn(!isCpfValid && 'text-destructive')}>
            CPF {!isCpfValid && '- Inválido'}
          </Label>
          <Input
            value={lead.cpf || ''}
            onChange={(e) => handleChange('cpf', maskCPF(e.target.value))}
            placeholder="000.000.000-00"
            className={cn(!isCpfValid && 'border-destructive focus-visible:ring-destructive')}
          />
        </div>
        <div className="grid gap-2">
          <Label>RG</Label>
          <Input
            value={lead.rg || ''}
            onChange={(e) => handleChange('rg', maskRG(e.target.value))}
            placeholder="00.000.000-0"
          />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label>Estado Civil</Label>
          <Select
            value={lead.marital_status || ''}
            onValueChange={(v) => handleChange('marital_status', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
              <SelectItem value="Casado(a)">Casado(a)</SelectItem>
              <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
              <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm border-b pb-2">Endereço</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              CEP {cepLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </Label>
            <Input
              value={lead.address_zip || ''}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Logradouro</Label>
            <Input
              value={lead.address_street || ''}
              onChange={(e) => handleChange('address_street', e.target.value)}
              placeholder="Rua, Avenida..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Número</Label>
            <Input
              value={lead.address_number || ''}
              onChange={(e) => handleChange('address_number', e.target.value)}
              placeholder="123"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Complemento</Label>
            <Input
              value={lead.address_complement || ''}
              onChange={(e) => handleChange('address_complement', e.target.value)}
              placeholder="Apto, Bloco..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Bairro</Label>
            <Input
              value={lead.address_neighborhood || ''}
              onChange={(e) => handleChange('address_neighborhood', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Cidade</Label>
            <Input
              value={lead.address_city || ''}
              onChange={(e) => handleChange('address_city', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>UF</Label>
            <Input
              value={lead.address_state || ''}
              onChange={(e) => handleChange('address_state', e.target.value)}
              maxLength={2}
              placeholder="SP"
              className="uppercase"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
