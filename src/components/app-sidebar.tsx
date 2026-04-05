import { Link, useLocation, useNavigate } from 'react-router-dom'
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
  LogOut,
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
import { Button } from '@/components/ui/button'
import { useAuth, Role } from '@/lib/auth'

type NavItem = {
  title: string
  url: string
  icon: any
  roles: Role[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'gerente', 'vendedor', 'cozinha', 'freelancer'],
  },
  { title: 'Leads', url: '/leads', icon: Users, roles: ['admin', 'vendedor'] },
  {
    title: 'Agenda',
    url: '/agenda',
    icon: CalendarDays,
    roles: ['admin', 'gerente', 'vendedor', 'freelancer'],
  },
  {
    title: 'Contratos',
    url: '/contracts',
    icon: FileText,
    roles: ['admin', 'gerente', 'vendedor'],
  },
  { title: 'Estoque', url: '/stock', icon: Package, roles: ['admin', 'gerente', 'cozinha'] },
  { title: 'Freelancers', url: '/freelancers', icon: UserCheck, roles: ['admin', 'gerente'] },
  { title: 'Financeiro', url: '/finance', icon: DollarSign, roles: ['admin', 'gerente'] },
  { title: 'Relatórios', url: '/settings', icon: Settings, roles: ['admin', 'gerente'] },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role))

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
              {filteredNavItems.map((item) => {
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
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <img
              src={`https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${user.id}`}
              alt={user.name}
              className="h-9 w-9 rounded-full bg-muted object-cover border"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium leading-none mb-1 truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Sair"
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
