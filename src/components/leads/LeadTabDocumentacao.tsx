import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Lead } from '@/services/leads'
import { maskCPF, maskRG, maskCEP, validateCPF } from '@/lib/formatters'
import { useToast } from '@/hooks/use-toast'

interface Props {
  lead: Partial<Lead>
  onChange: (lead: Partial<Lead>) => void
  onCpfValidChange?: (isValid: boolean) => void
  fieldErrors?: Record<string, string>
}

export function LeadTabDocumentacao({ lead, onChange, onCpfValidChange, fieldErrors = {} }: Props) {
  const [cpfError, setCpfError] = useState(false)
  const { toast } = useToast()

  const handleChange = (field: keyof Lead, value: any) => {
    onChange({ ...lead, [field]: value })
  }

  const handleCpfChange = (val: string) => {
    const masked = maskCPF(val)
    handleChange('cpf', masked)
    const hasError = masked.length === 14 && !validateCPF(masked)
    setCpfError(hasError)
    if (onCpfValidChange) onCpfValidChange(!hasError)
  }

  const handleCepChange = async (val: string) => {
    const masked = maskCEP(val)
    handleChange('address_zip', masked)

    const cleanCep = masked.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          onChange({
            ...lead,
            address_zip: masked,
            address_street: data.logradouro,
            address_neighborhood: data.bairro,
            address_city: data.localidade,
            address_state: data.uf,
          })
          toast({ title: 'Endereço preenchido via CEP' })
        }
      } catch (e) {
        console.error('Failed to fetch address via CEP:', e)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>CPF</Label>
          <Input
            value={lead.cpf || ''}
            onChange={(e) => handleCpfChange(e.target.value)}
            placeholder="000.000.000-00"
            className={
              cpfError || fieldErrors.cpf ? 'border-red-500 focus-visible:ring-red-500' : ''
            }
          />
          {cpfError && <p className="text-xs text-red-500 mt-1">CPF Inválido</p>}
          {fieldErrors.cpf && !cpfError && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.cpf}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>RG</Label>
          <Input
            value={lead.rg || ''}
            onChange={(e) => handleChange('rg', maskRG(e.target.value))}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
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
      <Separator />
      <h4 className="font-semibold text-sm">Endereço Residencial</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>CEP</Label>
          <Input
            value={lead.address_zip || ''}
            onChange={(e) => handleCepChange(e.target.value)}
            placeholder="00000-000"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Logradouro</Label>
          <Input
            value={lead.address_street || ''}
            onChange={(e) => handleChange('address_street', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Número</Label>
          <Input
            value={lead.address_number || ''}
            onChange={(e) => handleChange('address_number', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Complemento</Label>
          <Input
            value={lead.address_complement || ''}
            onChange={(e) => handleChange('address_complement', e.target.value)}
            placeholder="Apto, Bloco..."
          />
        </div>
        <div className="space-y-2">
          <Label>Bairro</Label>
          <Input
            value={lead.address_neighborhood || ''}
            onChange={(e) => handleChange('address_neighborhood', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input
            value={lead.address_city || ''}
            onChange={(e) => handleChange('address_city', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>UF</Label>
          <Input
            value={lead.address_state || ''}
            onChange={(e) => handleChange('address_state', e.target.value)}
            maxLength={2}
            placeholder="SP"
          />
        </div>
      </div>
    </div>
  )
}
