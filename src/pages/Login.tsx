import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, Role } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, PartyPopper } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock network request delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Credenciais inválidas. A senha deve ter no mínimo 8 caracteres.',
      })
      setIsLoading(false)
      return
    }

    const roleMap: Record<string, Role> = {
      'admin@tribo.com': 'admin',
      'gerente@tribo.com': 'gerente',
      'vendedor@tribo.com': 'vendedor',
      'cozinha@tribo.com': 'cozinha',
      'freelancer@tribo.com': 'freelancer',
    }

    const userRole = roleMap[email.toLowerCase()]

    if (!userRole) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Email não cadastrado ou credenciais inválidas.',
      })
      setIsLoading(false)
      return
    }

    login(email, userRole)
    toast({
      title: 'Login realizado com sucesso',
      description: 'Redirecionando para o dashboard...',
    })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 animate-fade-in">
      <div className="flex items-center gap-2 font-bold text-3xl text-primary mb-8">
        <PartyPopper className="h-8 w-8 text-secondary" />
        <span>Tribo da Folia</span>
      </div>
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Acesse o CRM utilizando suas credenciais.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tribo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault()
                    toast({
                      title: 'Recuperação de Senha',
                      description: 'Link de recuperação enviado para seu email (simulação).',
                    })
                  }}
                >
                  Esqueci minha senha
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md border border-border/50">
              <p className="font-semibold mb-1 text-foreground">
                Contas de teste (senha &gt; 8 chars):
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>admin@tribo.com</li>
                <li>gerente@tribo.com</li>
                <li>vendedor@tribo.com</li>
                <li>cozinha@tribo.com</li>
                <li>freelancer@tribo.com</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
