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
import { Textarea } from '@/components/ui/textarea'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const formSchema = z.object({
  client_id: z.string().min(1, 'Required'),
  birthday_person_id: z.string().optional().or(z.literal('')),
  event_date: z.string().min(1, 'Required'),
  start_time: z.string().min(1, 'Required'),
  duration: z.coerce.number().min(4).max(12).default(4),
  salon_selection: z.string().min(1, 'Required'),
  menu_id: z.string().min(1, 'Required'),
  guests: z.coerce.number().min(50, 'Minimum 50'),
  theme: z.string().optional(),
  theme_notes: z.string().optional(),
  cake_flavor: z.string().optional(),
  cake_notes: z.string().optional(),
  decoration_supplier_id: z.string().optional().or(z.literal('')),
  photographer: z.boolean().default(false),
  photographer_courtesy: z.boolean().default(false),
  extra_decoration: z.boolean().default(false),
  extra_decoration_courtesy: z.boolean().default(false),
  has_alcohol: z.boolean().default(false),
  courtesies: z.string().optional(),
  installments: z.coerce.number().min(1).max(12),
  payment_method: z.string().min(1, 'Required'),
  payment_day: z
    .union([z.coerce.number().min(1).max(31), z.literal(''), z.literal(0)])
    .optional()
    .transform((v) => (v === '' || v === 0 ? undefined : v)),
  payment_notes: z.string().optional(),
  bank_details: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ContractForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (contractId?: string) => void
  onCancel: () => void
}) {
  const [leads, setLeads] = useState<any[]>([])
  const [childrenList, setChildrenList] = useState<any[]>([])
  const [menus, setMenus] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewInstallments, setPreviewInstallments] = useState<any[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guests: 50,
      installments: 1,
      photographer: false,
      extra_decoration: false,
      has_alcohol: false,
      client_id: '',
      birthday_person_id: '',
      menu_id: '',
      start_time: '',
      duration: 4,
      salon_selection: '',
      payment_method: '',
      decoration_supplier_id: '',
      theme: '',
      theme_notes: '',
      cake_flavor: '',
      cake_notes: '',
      payment_notes: '',
      courtesies: '',
      bank_details: '',
    },
  })

  useEffect(() => {
    pb.collection('leads').getFullList({ sort: '-created' }).then(setLeads)
    pb.collection('menus').getFullList({ sort: 'name' }).then(setMenus)
    pb.collection('suppliers').getFullList({ sort: 'name' }).then(setSuppliers)
  }, [])

  const clientId = form.watch('client_id')
  useEffect(() => {
    if (clientId) {
      pb.collection('children')
        .getFullList({ filter: `lead_id = '${clientId}'` })
        .then(setChildrenList)
        .catch(() => setChildrenList([]))
    } else {
      setChildrenList([])
    }
  }, [clientId])

  const values = form.watch()
  const selectedMenu = menus.find((m) => m.id === values.menu_id)

  const calculation = useMemo(() => {
    let baseValue = 0,
      discount = 0,
      extraGuestsValue = 0
    const isEscolar = selectedMenu?.name.toLowerCase() === 'escolar'
    const isPrime = values.salon_selection === 'Prime & KidsTeens'
    const salonFee = isPrime ? 4500 : 0

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
    const baseValueBeforeOvertime =
      baseValue - discount + extraGuestsValue + photoVal + decoVal + salonFee
    const duration = values.duration || 4
    const extraHours = Math.max(0, duration - 4)
    const overtimeVal = extraHours * (baseValueBeforeOvertime * 0.25)
    const totalValue = baseValueBeforeOvertime + overtimeVal

    return {
      baseValue,
      discount,
      extraGuestsValue,
      photoVal,
      decoVal,
      salonFee,
      overtimeVal,
      baseValueBeforeOvertime,
      totalValue,
      values,
    }
  }, [selectedMenu, values])

  const ageAtParty = useMemo(() => {
    if (!values.event_date || !values.birthday_person_id || values.birthday_person_id === 'none')
      return null
    const child = childrenList.find((c) => c.id === values.birthday_person_id)
    if (!child || !child.birthday) return null

    const b = new Date(child.birthday)
    const p = new Date(values.event_date)
    if (isNaN(b.getTime()) || isNaN(p.getTime())) return null

    let age = p.getFullYear() - b.getFullYear()
    const m = p.getMonth() - b.getMonth()
    if (m < 0 || (m === 0 && p.getDate() < b.getDate())) {
      age--
    }
    return Math.max(0, age)
  }, [values.event_date, values.birthday_person_id, childrenList])

  const handleGenerateInstallments = () => {
    if (!calculation.totalValue || !values.installments || !values.event_date) {
      toast.error('Preencha data, parcelas e verifique o valor antes de gerar.')
      return
    }

    const eventDateObj = new Date(`${values.event_date}T12:00:00.000Z`)
    const eventLimitDate = new Date(eventDateObj)
    eventLimitDate.setDate(eventLimitDate.getDate() - 10)

    const inst = []
    const amountPerInst = calculation.totalValue / values.installments

    for (let i = 0; i < values.installments; i++) {
      let dueDate = new Date()
      dueDate.setMonth(dueDate.getMonth() + i)

      if (values.payment_day) {
        const month = new Date().getMonth() + i
        const year = new Date().getFullYear() + Math.floor(month / 12)
        const adjustedMonth = month % 12
        const maxDays = new Date(year, adjustedMonth + 1, 0).getDate()
        dueDate = new Date(year, adjustedMonth, Math.min(values.payment_day, maxDays))
      }

      if (dueDate > eventLimitDate) {
        dueDate = new Date(eventLimitDate)
      }

      const payoutDate = new Date(dueDate)
      payoutDate.setDate(payoutDate.getDate() + (values.payment_method === 'Credit Card' ? 30 : 1))

      inst.push({
        amount: amountPerInst,
        due_date: dueDate.toISOString(),
        payout_date: payoutDate.toISOString(),
        status: 'Pending',
        payment_method: values.payment_method,
      })
    }
    setPreviewInstallments(inst)
  }

  const onSubmit = async (data: FormValues) => {
    if (previewInstallments.length === 0) {
      return toast.error('Gere o parcelamento primeiro.')
    }

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

      const itemsBreakdown = [
        { name: 'Base Menu', status: 'Charged', value: calculation.baseValue },
        ...(calculation.discount > 0
          ? [{ name: 'Weekday Discount', status: 'Discount', value: -calculation.discount }]
          : []),
        ...(calculation.extraGuestsValue > 0
          ? [{ name: 'Extra Guests', status: 'Charged', value: calculation.extraGuestsValue }]
          : []),
        ...(calculation.salonFee > 0
          ? [{ name: 'Taxa Prime & KidsTeens', status: 'Charged', value: calculation.salonFee }]
          : []),
        ...(calculation.overtimeVal > 0
          ? [{ name: 'Horas Extras', status: 'Charged', value: calculation.overtimeVal }]
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
        birthday_person_id: data.birthday_person_id || undefined,
        total_value: calculation.baseValueBeforeOvertime,
        duration: data.duration,
        status: 'draft',
        notes: `Theme: ${data.theme || '-'}`,
        cake_notes: data.cake_notes,
        theme_notes: data.theme_notes,
        payment_notes: data.payment_notes,
        payment_day: data.payment_day,
        event_date: `${data.event_date} 12:00:00.000Z`,
        contract_number: `CTR-${Date.now()}`,
        items_breakdown: itemsBreakdown,
        payment_method: data.payment_method,
        installments: data.installments,
        decoration_supplier_id: data.decoration_supplier_id || undefined,
        event_start_time: data.start_time,
        guest_count: data.guests,
        salon: data.salon_selection,
        has_alcohol: data.has_alcohol,
        courtesies: data.courtesies,
        bank_details: data.bank_details,
        menu_id: data.menu_id,
      })

      for (const inst of previewInstallments) {
        await pb.collection('payments').create({
          contract_id: contractRecord.id,
          amount: inst.amount,
          due_date: inst.due_date,
          payout_date: inst.payout_date,
          payment_method: inst.payment_method,
          status: inst.status,
        })
      }

      const client = leads.find((l) => l.id === data.client_id)
      const child = childrenList.find((c) => c.id === data.birthday_person_id)
      const title = child ? `Festa de ${child.name}` : `Evento de ${client?.name || 'Cliente'}`

      await pb.collection('events').create({
        title,
        date: `${data.event_date} 12:00:00.000Z`,
        time: data.start_time,
        salon: data.salon_selection,
        client_name: client?.name || '',
        guests: data.guests,
        menu: selectedMenu?.name || '',
        status: 'confirmed',
        start_time: data.start_time,
        salon_selection: data.salon_selection,
        duration: data.duration,
        theme: data.theme,
        cake_flavor: data.cake_flavor,
        decoration_supplier_id: data.decoration_supplier_id || undefined,
        contract_id: contractRecord.id,
      })

      toast.success('Contract generated successfully! Event confirmed automatically.')
      onSuccess(contractRecord.id)
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
                <FormLabel>Contractor / Client</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
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
            name="birthday_person_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Celebrant (Child)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  disabled={!clientId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select child" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {childrenList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ageAtParty !== null && (
                  <p className="text-xs font-semibold text-primary mt-1">
                    Age at Party: {ageAtParty}
                  </p>
                )}
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
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="12:30">12:30</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                      <SelectItem value="19:30">19:30</SelectItem>
                      <SelectItem value="20:00">20:00</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (Horas)</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(parseInt(v, 10))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[4, 5, 6, 7, 8].map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h} horas
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="salon_selection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salon Selection</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Espaço Premium">Espaço Premium</SelectItem>
                    <SelectItem value="Espaço Kids&Teens">Espaço Kids&Teens</SelectItem>
                    <SelectItem value="Prime & KidsTeens">Prime & KidsTeens</SelectItem>
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
                <Select onValueChange={field.onChange} value={field.value || undefined}>
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
            name="decoration_supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decoration Supplier</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(val === 'none' ? '' : val)}
                  value={field.value || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None / Vem de fora</SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="theme_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações do Tema</FormLabel>
                <FormControl>
                  <Input placeholder="Details..." {...field} value={field.value || ''} />
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
            name="cake_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações do Bolo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dietary restrictions..."
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
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
            <div className="space-y-2 mt-4 md:mt-0">
              <FormField
                control={form.control}
                name="has_alcohol"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Festa Com Álcool</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2 mt-4 md:mt-0 col-span-1 md:col-span-2">
              <FormField
                control={form.control}
                name="courtesies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cortesias Descritivo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Tunel de LED, Sorvete..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Slip">Bank Slip</SelectItem>
                    <SelectItem value="TransferenciaDeposito">Transferência/Depósito</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Day (Day X)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Optional fixed day"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações do Pagamento</FormLabel>
                <FormControl>
                  <Input placeholder="Agreements..." {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_details"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Dados Bancários (Contrato)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informações bancárias personalizadas..."
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Payment Schedule</h3>
            <Button type="button" variant="secondary" onClick={handleGenerateInstallments}>
              Gerar Parcelas
            </Button>
          </div>

          {previewInstallments.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewInstallments.map((inst, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(inst.amount)}
                    </TableCell>
                    <TableCell>{new Date(inst.due_date).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {previewInstallments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Clique em Gerar Parcelas para pré-visualizar o cronograma de pagamentos (Regra de
              liquidação 10 dias antes do evento aplicada).
            </p>
          )}
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
