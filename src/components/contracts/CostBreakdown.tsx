import React from 'react'

interface CostBreakdownProps {
  baseValue: number
  discount: number
  extraGuestsValue: number
  photoVal: number
  decoVal: number
  totalValue: number
  values: any
}

export function CostBreakdown({
  baseValue,
  discount,
  extraGuestsValue,
  photoVal,
  decoVal,
  totalValue,
  values,
}: CostBreakdownProps) {
  const duration = values.duration || 4
  const extraHours = Math.max(0, duration - 4)

  const actualPhotoVal = values.photographer && !values.photographer_courtesy ? photoVal : 0
  const actualDecoVal = values.extra_decoration && !values.extra_decoration_courtesy ? decoVal : 0

  const subTotal = baseValue - discount + extraGuestsValue + actualPhotoVal + actualDecoVal
  const extraHoursFee = extraHours > 0 ? subTotal * 0.25 * extraHours : 0

  return (
    <div className="bg-muted p-4 rounded-lg space-y-4 text-sm mt-4 border border-border/50 shadow-sm">
      <h4 className="font-semibold text-base">Planilha de Custos Detalhada</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <tr>
              <td className="py-2">Cardápio Base</td>
              <td className="py-2">Cobrado</td>
              <td className="py-2 text-right">R$ {baseValue.toFixed(2)}</td>
            </tr>
            {discount > 0 && (
              <tr>
                <td className="py-2">Desconto</td>
                <td className="py-2 text-emerald-600">Desconto</td>
                <td className="py-2 text-right text-emerald-600">-R$ {discount.toFixed(2)}</td>
              </tr>
            )}
            {extraGuestsValue > 0 && (
              <tr>
                <td className="py-2">Convidados Extras</td>
                <td className="py-2">Cobrado</td>
                <td className="py-2 text-right">R$ {extraGuestsValue.toFixed(2)}</td>
              </tr>
            )}
            {values.photographer && (
              <tr>
                <td className="py-2">Fotógrafo</td>
                <td className="py-2 text-muted-foreground">
                  {values.photographer_courtesy ? 'Cortesia' : 'Cobrado'}
                </td>
                <td className="py-2 text-right">R$ {actualPhotoVal.toFixed(2)}</td>
              </tr>
            )}
            {values.extra_decoration && (
              <tr>
                <td className="py-2">Decoração Extra</td>
                <td className="py-2 text-muted-foreground">
                  {values.extra_decoration_courtesy ? 'Cortesia' : 'Cobrado'}
                </td>
                <td className="py-2 text-right">R$ {actualDecoVal.toFixed(2)}</td>
              </tr>
            )}
            {extraHours > 0 && (
              <tr>
                <td className="py-2">Horas Extras ({extraHours}h) - 25%/h</td>
                <td className="py-2">Cobrado</td>
                <td className="py-2 text-right">R$ {extraHoursFee.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold text-base border-t border-border">
              <td className="pt-4" colSpan={2}>
                Valor Total do Contrato
              </td>
              <td className="pt-4 text-right text-primary">R$ {(totalValue || 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
