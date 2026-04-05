import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createAssignment } from '@/services/freelancers'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

const formSchema = z.object({
  event_id: z.string().min(1, 'Evento é obrigatório'),
  freelancer_id: z.string().min(1, 'Freelancer é obrigatório'),
  role: z.string().min(1, 'Cargo é obrigatório'),
  status: z.string().default('Escalado'),
})

export function AssignmentSheet({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const { toast } = useToast()
  const [events, setEvents] = useState<any[]>([])
  const [freelancers, setFreelancers] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      supabase
        .from('events')
        .select('id, title, date')
        .gte('date', new Date().toISOString().split('T')[0])
        .then(({ data }) => setEvents(data || []))
      supabase
        .from('freelancers')
        .select('id, name')
        .then(({ data }) => setFreelancers(data || []))
    }
  }, [open])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { event_id: '', freelancer_id: '', role: '', status: 'Escalado' },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createAssignment(values)
      toast({ title: 'Sucesso', description: 'Escala registrada com sucesso.' })
      form.reset()
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao registrar escala.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nova Escala</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="event_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o evento..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {events.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.title} - {format(new Date(e.date), 'dd/MM/yyyy')}
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
              name="freelancer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Freelancer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o freelancer..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {freelancers.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo na Escala</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Garçom">Garçom</SelectItem>
                      <SelectItem value="Monitor">Monitor</SelectItem>
                      <SelectItem value="Segurança">Segurança</SelectItem>
                      <SelectItem value="Cozinha">Aux. Cozinha</SelectItem>
                      <SelectItem value="Gerente">Gerente de Festa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4">
              <Button type="submit" className="w-full">
                Salvar Escala
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
