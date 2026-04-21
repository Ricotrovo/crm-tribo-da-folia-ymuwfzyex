import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { updateContract } from '@/services/contracts'
import { CostBreakdown } from './CostBreakdown'

const formSchema = z.object({
  event_date: z.string().min(1, 'Required'),
  event_start_time: z.string().min(1, 'Required'),
  duration: z.coerce.number().min(4).max(12),
  salon: z.string().min(1, 'Required'),
  menu_id: z.string().min(1, 'Required'),
  guest_count: z.coerce.number().min(50, 'Minimum 50'),
  status: z.string().min(1),
  notes: z.string().optional(),
  cake_notes: z.string().optional(),
  theme_notes: z.string().optional(),
  payment_notes: z.string().optional(),
  bank_details: z.string().optional(),
  has_alcohol: z.boolean().default(false),
  courtesies: z.string().optional(),
  photographer: z.boolean().default(false),
  photographer_courtesy: z.boolean().default(false),
  extra_decoration: z.boolean().default(false),
  extra_decoration_courtesy: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

function calculateEndTime(start: string, duration: number) {
  if (!start) return ''
  const [h, m] = start.split(':').map(Number)
  const endH = (h + duration) % 24
  return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function EditContractSheet({ contract, open, onOpenChange, onSuccess }: any) {
  const [menus, setMenus] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      event_date: '',
      event_start_time: '',
      duration: 4,
      salon: '',
      menu_id: '',
      guest_count: 50,
      status: 'draft',
      notes: '',
      cake_notes: '',
      theme_notes: '',
      payment_notes: '',
      bank_details: '',
      has_alcohol: false,
      courtesies: '',
      photographer: false,
      photographer_courtesy: false,
      extra_decoration: false,
      extra_decoration_courtesy: false,
    },
  })

  useEffect(() => {
    pb.collection('menus').getFullList({ sort: 'name' }).then(setMenus)
  }, [])

  useEffect(() => {
    if (contract && open) {
      const bd = contract.items_breakdown || []
      const photoItem = bd.find((i: any) => i.name === 'Photographer')
      const decoItem = bd.find((i: any) => i.name === 'Extra Decoration')

      form.reset({
        event_date: contract.event_date ? contract.event_date.split(' ')[0] : '',
        event_start_time: contract.event_start_time || '',
        duration: contract.duration || 4,
        salon: contract.salon || '',
        menu_id: contract.menu_id || '',
        guest_count: contract.guest_count || 50,
        status: contract.status || 'draft',
        notes: contract.notes || '',
        cake_notes: contract.cake_notes || '',
        theme_notes: contract.theme_notes || '',
        payment_notes: contract.payment_notes || '',
        bank_details: contract.bank_details || '',
        has_alcohol: contract.has_alcohol || false,
        courtesies: contract.courtesies || '',
        photographer: photoItem && photoItem.status !== 'None',
        photographer_courtesy: photoItem && photoItem.status === 'Courtesy',
        extra_decoration: decoItem && decoItem.status !== 'None',
        extra_decoration_courtesy: decoItem && decoItem.status === 'Courtesy',
      })
    }
  }, [contract, open, form])

  const values = form.watch()
  const selectedMenu = menus.find((m) => m.id === values.menu_id)

  const calculation = useMemo(() => {
    let baseValue = 0,
      discount = 0,
      extraGuestsValue = 0
    const isEscolar = selectedMenu?.name.toLowerCase() === 'escolar'
    const isPrime = values.salon === 'Prime & KidsTeens'
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
      const extraGuestsCount = Math.max(0, (values.guest_count || 50) - 50)
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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
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

      const event_end_time = calculateEndTime(data.event_start_time, data.duration)

      await updateContract(contract.id, {
        event_date: `${data.event_date} 12:00:00.000Z`,
        event_start_time: data.event_start_time,
        event_end_time,
        duration: data.duration,
        salon: data.salon,
        menu_id: data.menu_id,
        guest_count: data.guest_count,
        status: data.status,
        notes: data.notes,
        cake_notes: data.cake_notes,
        theme_notes: data.theme_notes,
        payment_notes: data.payment_notes,
        bank_details: data.bank_details,
        has_alcohol: data.has_alcohol,
        courtesies: data.courtesies,
        total_value: calculation.totalValue,
        items_breakdown: itemsBreakdown,
      })

      const events = await pb
        .collection('events')
        .getFullList({ filter: `contract_id = '${contract.id}'` })
      for (const ev of events) {
        await pb.collection('events').update(ev.id, {
          date: `${data.event_date} 12:00:00.000Z`,
          time: data.event_start_time,
          start_time: data.event_start_time,
          duration: data.duration,
          salon: data.salon,
          salon_selection: data.salon,
          guests: data.guest_count,
          menu: selectedMenu?.name || '',
          status: data.status === 'canceled' ? 'canceled' : ev.status,
        })
      }

      toast.success('Contrato alterado com sucesso.')
      onSuccess()
    } catch (e: any) {
      toast.error('Falha ao atualizar o contrato.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFinalized = contract?.status === 'finalized'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Alterar Contrato #{contract?.contract_number}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Evento</FormLabel>
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
                  name="event_start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Início" />
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
                      <FormLabel>Duração</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(parseInt(v, 10))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Horas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[4, 5, 6, 7, 8].map((h) => (
                            <SelectItem key={h} value={String(h)}>
                              {h} h
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
                name="salon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salão</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Salão" />
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
                          <SelectValue placeholder="Menu" />
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
                name="guest_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Convidados</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!isFinalized && <SelectItem value="draft">Rascunho</SelectItem>}
                        {!isFinalized && <SelectItem value="active">Ativo</SelectItem>}
                        <SelectItem value="finalized">Finalizado</SelectItem>
                        <SelectItem value="canceled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
              <FormLabel>Opcionais e Cortesias</FormLabel>
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
                        <FormLabel className="cursor-pointer">Fotógrafo (+R$ 500)</FormLabel>
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
                            Cortesia
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
                        <FormLabel className="cursor-pointer">Decoração Extra (+R$ 300)</FormLabel>
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
                            Cortesia
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
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
                <FormField
                  control={form.control}
                  name="courtesies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cortesias Descritivo</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <CostBreakdown {...calculation} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="theme_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas do Tema</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cake_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas do Bolo</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas de Pagamento</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Gerais</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bank_details"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Dados Bancários</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
