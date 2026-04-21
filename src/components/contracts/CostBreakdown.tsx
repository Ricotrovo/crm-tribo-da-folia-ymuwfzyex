import React from 'react'

interface CostBreakdownProps {
  baseValue: number
  extraGuestsValue: number
  optionalsValue: number
  totalValue: number
}

export function CostBreakdown({
  baseValue,
  extraGuestsValue,
  optionalsValue,
  totalValue,
}: CostBreakdownProps) {
  return (
    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm mt-4">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Valor Base do Menu:</span>
        <span className="font-medium">R$ {baseValue.toFixed(2)}</span>
      </div>
      {extraGuestsValue > 0 && (
        <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
          <span>Valor Excedente (Convidados Extras):</span>
          <span className="font-medium">R$ {extraGuestsValue.toFixed(2)}</span>
        </div>
      )}
      {optionalsValue > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Opcionais (Foto/Decoração):</span>
          <span className="font-medium">R$ {optionalsValue.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between items-center pt-2 border-t mt-2">
        <span className="font-bold text-base">Valor Total do Contrato:</span>
        <span className="font-bold text-base text-primary">R$ {totalValue.toFixed(2)}</span>
      </div>
    </div>
  )
}
