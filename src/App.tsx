import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Index from './pages/Index'
import Leads from './pages/Leads'
import Agenda from './pages/Agenda'
import Contracts from './pages/Contracts'
import Stock from './pages/Stock'
import Supplies from './pages/Supplies'
import EventDetails from './pages/EventDetails'
import HR from './pages/HR'
import Finance from './pages/Finance'
import Settings from './pages/Settings'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import ContractPrint from './pages/ContractPrint'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/supplies" element={<Supplies />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/hr" element={<HR />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/contracts/:id/print" element={<ContractPrint />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
