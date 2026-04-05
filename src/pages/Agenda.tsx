import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockEvents } from '@/lib/mock-data'
import { Clock, MapPin, Plus } from 'lucide-react'

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const selectedDateStr = date?.toISOString().split('T')[0]
  const dayEvents = mockEvents.filter((e) => e.date === selectedDateStr)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground">Manage events and bookings.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-5 lg:col-span-4 flex flex-col items-center pt-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow-sm bg-card"
          />
          <div className="mt-6 w-full p-4 border-t space-y-2">
            <h4 className="text-sm font-semibold mb-2">Time Slots Available</h4>
            <div className="flex flex-wrap gap-2">
              {['12:00', '13:00', '19:00', '20:00'].map((time) => (
                <Badge
                  key={time}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                >
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Events for {date?.toLocaleDateString()}</CardTitle>
              <CardDescription>{dayEvents.length} event(s) scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              {dayEvents.length > 0 ? (
                <div className="space-y-4">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{evt.title}</h4>
                          <Badge variant={evt.status === 'Confirmed' ? 'default' : 'secondary'}>
                            {evt.status}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {evt.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {evt.salon} Salon
                          </span>
                        </div>
                        <p className="text-sm">
                          Client: <span className="font-medium text-foreground">{evt.client}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                  No events scheduled for this date.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
