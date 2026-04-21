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
  return (
    <div className="bg-muted p-4 rounded-lg space-y-4 text-sm mt-4 border border-border/50 shadow-sm">
      <h4 className="font-semibold text-base">Contract Itemization</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground">
              <th className="pb-2 font-medium">Item Name</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <tr>
              <td className="py-2">Base Menu</td>
              <td className="py-2">Charged</td>
              <td className="py-2 text-right">R$ {baseValue.toFixed(2)}</td>
            </tr>
            {discount > 0 && (
              <tr>
                <td className="py-2">Weekday Discount</td>
                <td className="py-2 text-emerald-600">Discount</td>
                <td className="py-2 text-right text-emerald-600">-R$ {discount.toFixed(2)}</td>
              </tr>
            )}
            {extraGuestsValue > 0 && (
              <tr>
                <td className="py-2">Extra Guests</td>
                <td className="py-2">Charged</td>
                <td className="py-2 text-right">R$ {extraGuestsValue.toFixed(2)}</td>
              </tr>
            )}
            {values.photographer && (
              <tr>
                <td className="py-2">Photographer</td>
                <td className="py-2 text-muted-foreground">
                  {values.photographer_courtesy ? 'Courtesy' : 'Charged'}
                </td>
                <td className="py-2 text-right">R$ {photoVal.toFixed(2)}</td>
              </tr>
            )}
            {values.extra_decoration && (
              <tr>
                <td className="py-2">Extra Decoration</td>
                <td className="py-2 text-muted-foreground">
                  {values.extra_decoration_courtesy ? 'Courtesy' : 'Charged'}
                </td>
                <td className="py-2 text-right">R$ {decoVal.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold text-base border-t border-border">
              <td className="pt-4" colSpan={2}>
                Total Contract Value
              </td>
              <td className="pt-4 text-right text-primary">R$ {totalValue.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
