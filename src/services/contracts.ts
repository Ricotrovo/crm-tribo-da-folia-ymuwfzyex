import { supabase } from '@/lib/supabase/client'
import { addDays, format } from 'date-fns'

export async function createContract(data: any, calculation: any) {
  // 1. Insert Contract
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .insert({
      client_id: data.client_id,
      event_id: data.event_id,
      base_value: calculation.baseValue,
      extra_guests_value: calculation.extraGuestsValue,
      optionals_value: calculation.optionalsValue,
      total_value: calculation.totalValue,
      installments: data.installments,
      payment_method: data.payment_method,
      status: 'Signed',
    })
    .select()
    .single()

  if (contractError) throw contractError

  // 2. Generate Installments
  const payments = []
  const installmentValue = calculation.totalValue / data.installments

  for (let i = 1; i <= data.installments; i++) {
    const days = data.installments > 1 ? i * 30 : 0
    const dueDate = addDays(new Date(), days)

    payments.push({
      contract_id: contract.id,
      amount: installmentValue,
      due_date: format(dueDate, 'yyyy-MM-dd'),
      installment_number: i,
      status: 'Pending',
    })
  }

  const { error: paymentsError } = await supabase.from('payments').insert(payments)

  if (paymentsError) throw paymentsError

  return contract
}

export async function exportContractToPDF(contract: any) {
  // Simulates PDF generation delay
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return true
}
