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
import { eventService } from '@/services/events'

const formSchema = z.object({
  client_id: z.string().min(1, 'Required'),
  event_date: z.string().min(1, 'Required'),
  start_time: z.string().min(1, 'Required'),
  salon_selection: z.string().min(1, 'Required'),
  menu_id: z.string().min(1, 'Required'),
  guests: z.coerce.number().min(50, 'Minimum 50'),
  theme: z.string().optional(),
  cake_flavor: z.string().optional(),
  decoration_supplier_id: z.string().optional().or(z.literal('')),
  photographer: z.boolean().default(false),
  photographer_courtesy: z.boolean().default(false),
  extra_decoration: z.boolean().default(false),
  extra_decoration_courtesy: z.boolean().default(false),
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
  const [menus, setMenus] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { guests: 50, installments: 1, photographer: false, extra_decoration: false },
  })

  useEffect(() => {
    pb.collection('leads').getFullList({ sort: '-created' }).then(setLeads)
    pb.collection('menus').getFullList({ sort: 'name' }).then(setMenus)
    pb.collection('suppliers').getFullList({ sort: 'name' }).then(setSuppliers)
  }, [])

  const values = form.watch()
  const selectedMenu = menus.find((m) => m.id === values.menu_id)

  const calculation = useMemo(() => {
    let baseValue = 0,
      discount = 0,
      extraGuestsValue = 0
    const isEscolar = selectedMenu?.name.toLowerCase() === 'escolar'

    if (selectedMenu && values.event_date) {
      const [year, month, day] = values.event_date.split('-').map(Number)
      const localDate = new Date(year, month - 1, day)
      const dayOfWeek = localDate.getDay()

      if (isEscolar) {
        baseValue = 4500
      } else {
        baseValue = selectedMenu.price_weekend || 0
        if (dayOfWeek >= 1 && dayOfWeek <= 4) discount = 1500
        else if (dayOfWeek === 5) discount = 500
      }
      const extraGuestsCount = Math.max(0, (values.guests || 50) - 50)
      extraGuestsValue = extraGuestsCount * (selectedMenu.extra_guest_price_advance || 0)
    }

    const photoVal = values.photographer && !values.photographer_courtesy ? 500 : 0
    const decoVal = values.extra_decoration && !values.extra_decoration_courtesy ? 300 : 0
    const totalValue = baseValue - discount + extraGuestsValue + photoVal + decoVal

    return { baseValue, discount, extraGuestsValue, photoVal, decoVal, totalValue, values }
  }, [selectedMenu, values])

  const onSubmit = async (data: FormValues) => {
    const isEscolar = selectedMenu?.name.toLowerCase() === 'escolar'
    if (isEscolar) {
      const [year, month, day] = data.event_date.split('-').map(Number)
      const d = new Date(year, month - 1, day).getDay()
      if (d === 0 || d === 6) return toast.error('Escolar package is only Mon-Fri.')
      if (data.start_time !== '14:00') return toast.error('Escolar package must start at 14:00.')
    }

    setIsSubmitting(true)
    try {
      const isAvailable = await eventService.checkAvailability(
        data.event_date,
        data.start_time,
        data.salon_selection,
      )
      if (!isAvailable) {
        setIsSubmitting(false)
        return toast.error(
          `Overbooking prevented! ${data.salon_selection} is occupied for this shift.`,
        )
      }

      const client = leads.find((l) => l.id === data.client_id)
      const eventRecord = await pb.collection('events').create({
        title: `Party - ${client?.name}`,
        date: `${data.event_date} 12:00:00.000Z`,
        start_time: data.start_time,
        salon_selection: data.salon_selection,
        duration: 4,
        guests: data.guests,
        menu: selectedMenu?.name,
        theme: data.theme,
        cake_flavor: data.cake_flavor,
        decoration_supplier_id: data.decoration_supplier_id || null,
        client_name: client?.name,
        status: 'Scheduled',
      })

      const itemsBreakdown = [
        { name: 'Base Menu', status: 'Charged', value: calculation.baseValue },
        ...(calculation.discount > 0
          ? [{ name: 'Weekday Discount', status: 'Discount', value: -calculation.discount }]
          : []),
        ...(calculation.extraGuestsValue > 0
          ? [{ name: 'Extra Guests', status: 'Charged', value: calculation.extraGuestsValue }]
          : []),
        {
          name: 'Photographer',
          status: data.photographer
            ? data.photographer_courtesy
              ? 'Courtesy'
              : 'Charged'
            : 'None',
          value: calculation.photoVal,
        },
        {
          name: 'Extra Decoration',
          status: data.extra_decoration
            ? data.extra_decoration_courtesy
              ? 'Courtesy'
              : 'Charged'
            : 'None',
          value: calculation.decoVal,
        },
      ]

      const contractRecord = await createContract({
        lead_id: data.client_id,
        total_value: calculation.totalValue,
        notes: `Event: ${eventRecord.id}, Theme: ${data.theme}`,
        event_date: `${data.event_date} 12:00:00.000Z`,
        contract_number: `CTR-${Date.now()}`,
        items_breakdown: itemsBreakdown,
        payment_method: data.payment_method,
        installments: data.installments,
        decoration_supplier_id: data.decoration_supplier_id || null,
      })

      for (let i = 0; i < data.installments; i++) {
        const dueDate = new Date()
        dueDate.setMonth(dueDate.getMonth() + i)
        const payoutDate = new Date(dueDate)
        payoutDate.setDate(payoutDate.getDate() + (data.payment_method === 'Credit Card' ? 30 : 1))

        await pb.collection('payments').create({
          contract_id: contractRecord.id,
          amount: calculation.totalValue / data.installments,
          due_date: dueDate.toISOString(),
          payout_date: payoutDate.toISOString(),
          payment_method: data.payment_method,
          status: 'Pending',
        })
      }

      toast.success('Contract generated successfully!')
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
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="12:00">12:00 (Lunch)</SelectItem>
                    <SelectItem value="12:30">12:30 (Lunch)</SelectItem>
                    <SelectItem value="14:00">14:00 (Escolar)</SelectItem>
                    <SelectItem value="19:00">19:00 (Dinner)</SelectItem>
                    <SelectItem value="19:30">19:30 (Dinner)</SelectItem>
                    <SelectItem value="20:00">20:00 (Dinner)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salon_selection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salon Selection</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Salon 1">Salon 1</SelectItem>
                    <SelectItem value="Salon 2">Salon 2</SelectItem>
                    <SelectItem value="Both">Both Salons</SelectItem>
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
                        {m.name}
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
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Safari" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cake_flavor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cake Flavor</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Chocolate" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="decoration_supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decoration Supplier</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
          <FormLabel>Optionals & Courtesies</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="photographer"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Photographer (+R$ 500)</FormLabel>
                  </FormItem>
                )}
              />
              {values.photographer && (
                <FormField
                  control={form.control}
                  name="photographer_courtesy"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 ml-6">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-emerald-600">
                        Mark as Courtesy
                      </FormLabel>
                    </FormItem>
                  )}
                />
              )}
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="extra_decoration"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Extra Decoration (+R$ 300)</FormLabel>
                  </FormItem>
                )}
              />
              {values.extra_decoration && (
                <FormField
                  control={form.control}
                  name="extra_decoration_courtesy"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 ml-6">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-emerald-600">
                        Mark as Courtesy
                      </FormLabel>
                    </FormItem>
                  )}
                />
              )}
            </div>
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
                    {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
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
