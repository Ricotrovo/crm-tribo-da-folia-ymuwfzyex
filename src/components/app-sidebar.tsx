import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  CircleDollarSign,
  Package,
  ShoppingCart,
  UserSquare2,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  const { signOut, user } = useAuth()
  const location = useLocation()

  const navItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Leads', url: '/leads', icon: Users },
    { title: 'Agenda de Festas', url: '/agenda', icon: CalendarDays },
    { title: 'Financeiro', url: '/finance', icon: CircleDollarSign },
    { title: 'Gestão Humana', url: '/hr', icon: UserSquare2 },
    { title: 'Estoque', url: '/stock', icon: Package },
    { title: 'Suprimentos', url: '/supplies', icon: ShoppingCart },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-xl font-bold tracking-tight text-primary">Tribo da Folia</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        {user && (
          <div className="flex flex-col gap-2">
            <div className="text-xs px-2 truncate text-muted-foreground font-medium">
              {user.email}
            </div>
            <SidebarMenuButton
              onClick={signOut}
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
