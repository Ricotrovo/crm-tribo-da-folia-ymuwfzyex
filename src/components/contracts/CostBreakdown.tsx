import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="pt-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base Value (up to 50 guests)</span>
          <span>R$ {baseValue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Extra Guests</span>
          <span>R$ {extraGuestsValue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Optionals</span>
          <span>R$ {optionalsValue.toFixed(2)}</span>
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between font-bold text-lg text-primary">
          <span>Total</span>
          <span>R$ {totalValue.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
