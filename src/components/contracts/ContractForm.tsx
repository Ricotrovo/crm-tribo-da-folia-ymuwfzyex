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
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { createContract } from '@/services/contracts'

const formSchema = z.object({
  client_id: z.string().min(1, 'Required'),
  event_id: z.string().min(1, 'Required'),
  menu_id: z.string().min(1, 'Required'),
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
  const [leads, setLeads] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [menus, setMenus] = useState<any[]>([])
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
    pb.collection('leads').getFullList({ sort: '-created' }).then(setLeads)
    pb.collection('events').getFullList({ sort: '-created' }).then(setEvents)
    pb.collection('menus').getFullList({ sort: 'name' }).then(setMenus)
  }, [])

  const values = form.watch()
  const selectedMenu = menus.find((m) => m.id === values.menu_id)
  const selectedEvent = events.find((e) => e.id === values.event_id)

  const calculation = useMemo(() => {
    let baseValue = 0
    let extraGuestsValue = 0

    if (selectedMenu && selectedEvent?.date) {
      const [year, month, day] = selectedEvent.date.split(' ')[0].split('-').map(Number)
      const localDate = new Date(year, month - 1, day)
      const dayOfWeek = localDate.getDay()

      if (selectedMenu.name.toLowerCase() === 'escolar') {
        baseValue = selectedMenu.price_weekday || 4500
      } else {
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          baseValue = selectedMenu.price_weekend || 0
        } else if (dayOfWeek === 5) {
          baseValue = selectedMenu.price_holiday || 0
        } else {
          baseValue = selectedMenu.price_weekday || 0
        }
      }

      const extraGuestsCount = Math.max(0, (values.guests || 50) - 50)
      extraGuestsValue = extraGuestsCount * (selectedMenu.extra_guest_price_advance || 0)
    }

    const optionalsValue = (values.photographer ? 500 : 0) + (values.decoration ? 300 : 0)
    const totalValue = baseValue + extraGuestsValue + optionalsValue

    return { baseValue, extraGuestsValue, optionalsValue, totalValue }
  }, [selectedMenu, selectedEvent, values.guests, values.photographer, values.decoration])

  const onSubmit = async (data: FormValues) => {
    if (selectedMenu?.name.toLowerCase() === 'escolar' && selectedEvent?.date) {
      const [year, month, day] = selectedEvent.date.split(' ')[0].split('-').map(Number)
      const localDate = new Date(year, month - 1, day)
      const dayOfWeek = localDate.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        toast.error('O pacote Escolar só é permitido de Segunda a Sexta-feira.')
        return
      }

      if (selectedEvent.time) {
        const [hours, minutes] = selectedEvent.time.split(':').map(Number)
        const timeInMinutes = hours * 60 + (minutes || 0)
        const startLimit = 14 * 60
        const endLimit = 17 * 60
        if (timeInMinutes < startLimit || timeInMinutes > endLimit) {
          toast.error('O pacote Escolar só é permitido no horário de 14:00 às 17:00.')
          return
        }
      }
    }

    try {
      setIsSubmitting(true)
      await createContract({
        lead_id: data.client_id,
        total_value: calculation.totalValue,
        notes: `Menu: ${selectedMenu?.name}, Guests: ${data.guests}, Event: ${selectedEvent?.title}`,
        event_date: selectedEvent?.date || '',
        contract_number: `CTR-${Date.now()}`,
      })

      if (selectedEvent) {
        await pb.collection('events').update(selectedEvent.id, {
          menu: selectedMenu?.name,
          guests: data.guests,
        })
      }

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
                <FormLabel>Client / Lead</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leads.map((c) => (
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
                        {e.title} ({e.date ? e.date.split(' ')[0] : 'No date'})
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
            name="menu_id"
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
                    {menus.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} (Base R$ {m.price_weekend})
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
