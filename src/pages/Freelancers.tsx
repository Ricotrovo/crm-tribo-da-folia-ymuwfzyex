import { mockFreelancers } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Mail, UserPlus, Settings2 } from 'lucide-react'

export default function Freelancers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff & Freelancers</h2>
          <p className="text-muted-foreground">Manage your event team and availability.</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockFreelancers.map((staff) => (
          <Card
            key={staff.id}
            className="overflow-hidden hover:border-primary/50 transition-colors"
          >
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://img.usecurling.com/ppl/medium?seed=${staff.id}`}
                    alt={staff.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-background"
                  />
                  <div>
                    <CardTitle className="text-base">{staff.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={
                    staff.status === 'Available'
                      ? 'default'
                      : staff.status === 'Busy'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {staff.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{staff.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">
                  {staff.name.toLowerCase().replace(' ', '.')}@example.com
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
