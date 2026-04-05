import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CostBreakdown } from './CostBreakdown'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { createContract } from '@/services/contracts'

const formSchema = z.object({
  client_id: z.string().min(1, 'Required'),
  event_id: z.string().min(1, 'Required'),
  menu: z.string().min(1, 'Required'),
  guests: z.coerce.number().min(1),
  photographer: z.boolean().default(false),
  decoration: z.boolean().default(false),
  installments: z.coerce.number().min(1).max(12),
  payment_method: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof formSchema>

export function ContractForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const [clients, setClients] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guests: 50,
      installments: 1,
      photographer: false,
      decoration: false,
    },
  })

  useEffect(() => {
    supabase
      .from('clients')
      .select('*')
      .then(({ data }) => setClients(data || []))
    supabase
      .from('events')
      .select('*, contracts(id)')
      .then(({ data }) => {
        setEvents((data || []).filter((e) => !e.contracts || e.contracts.length === 0))
      })
  }, [])

  const values = form.watch()

  const calculation = useMemo(() => {
    const baseValue = values.menu === 'Premium' ? 3000 : 2000
    const extraGuestsCount = Math.max(0, (values.guests || 50) - 50)
    const extraGuestsValue = extraGuestsCount * (values.menu === 'Premium' ? 80 : 50)
    const optionalsValue = (values.photographer ? 500 : 0) + (values.decoration ? 300 : 0)
    const totalValue = baseValue + extraGuestsValue + optionalsValue

    return { baseValue, extraGuestsValue, optionalsValue, totalValue }
  }, [values.menu, values.guests, values.photographer, values.decoration])

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      await createContract(data, calculation)
      toast.success('Contract and installments generated successfully!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contract')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="event_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="menu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Menu</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select menu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Standard">Standard (R$ 2000)</SelectItem>
                    <SelectItem value="Premium">Premium (R$ 3000)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="guests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guests</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <FormLabel>Optionals</FormLabel>
          <div className="flex flex-col sm:flex-row gap-6">
            <FormField
              control={form.control}
              name="photographer"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Photographer (+R$ 500)
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="decoration"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Extra Decoration (+R$ 300)
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <CostBreakdown {...calculation} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="installments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Installments</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseInt(v, 10))}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 12].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Slip">Bank Slip</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Contract'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
