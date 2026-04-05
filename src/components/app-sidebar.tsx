import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  DollarSign,
  Package,
  UserCheck,
  Settings,
  PartyPopper,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Leads (Funnel)', url: '/leads', icon: Users },
  { title: 'Agenda', url: '/agenda', icon: CalendarDays },
  { title: 'Contracts', url: '/contracts', icon: FileText },
  { title: 'Finance', url: '/finance', icon: DollarSign },
  { title: 'Stock', url: '/stock', icon: Package },
  { title: 'Freelancers', url: '/freelancers', icon: UserCheck },
  { title: 'Settings', url: '/settings', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <PartyPopper className="h-6 w-6 text-secondary" />
          <span>Tribo da Folia</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url} className={cn(isActive && 'text-primary font-semibold')}>
                        <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <img
            src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1"
            alt="User"
            className="h-8 w-8 rounded-full bg-muted object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Maria Admin</span>
            <span className="text-xs text-muted-foreground">Manager</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
