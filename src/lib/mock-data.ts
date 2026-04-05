export type Lead = {
  id: string
  name: string
  status: 'Contact' | 'Visit' | 'Negotiation' | 'Closed'
  value: number
  date: string
}
export type Event = {
  id: string
  title: string
  date: string
  time: string
  salon: 'Premium' | 'Kids&Teens'
  client: string
  status: 'Confirmed' | 'Pending'
}
export type Contract = {
  id: string
  num: number
  client: string
  date: string
  value: number
  status: 'Draft' | 'Signed' | 'Paid' | 'Completed' | 'Cancelled'
}
export type StockItem = { id: string; name: string; category: string; qty: number; minQty: number }
export type Freelancer = {
  id: string
  name: string
  role: string
  phone: string
  status: 'Available' | 'Busy' | 'Offline'
}
export type Activity = {
  id: string
  action: string
  user: string
  time: string
  type: 'sale' | 'system' | 'event'
}

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Família Silva (Aniversário 5 anos)',
    status: 'Contact',
    value: 3500,
    date: '2023-11-01',
  },
  { id: '2', name: 'Festa da Duda', status: 'Visit', value: 4200, date: '2023-11-02' },
  { id: '3', name: 'João Pedro - Heróis', status: 'Negotiation', value: 5100, date: '2023-11-03' },
  { id: '4', name: 'Casamento Sra. Mendes', status: 'Closed', value: 8500, date: '2023-11-04' },
  { id: '5', name: 'Formatura Teens', status: 'Contact', value: 6000, date: '2023-11-05' },
]

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Aniversário Leo (Safari)',
    date: new Date().toISOString().split('T')[0],
    time: '13:00',
    salon: 'Kids&Teens',
    client: 'Ana Costa',
    status: 'Confirmed',
  },
  {
    id: '2',
    title: '15 Anos Beatriz',
    date: new Date().toISOString().split('T')[0],
    time: '19:30',
    salon: 'Premium',
    client: 'Roberto Dias',
    status: 'Confirmed',
  },
  {
    id: '3',
    title: 'Festa Infantil (Dinossauros)',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '12:00',
    salon: 'Kids&Teens',
    client: 'Carlos Silva',
    status: 'Pending',
  },
  {
    id: '4',
    title: 'Chá de Bebê',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    time: '19:00',
    salon: 'Premium',
    client: 'Mariana Luz',
    status: 'Confirmed',
  },
]

export const mockContracts: Contract[] = [
  { id: 'c1', num: 8023, client: 'Mariana Luz', date: '2023-11-05', value: 4500, status: 'Paid' },
  {
    id: 'c2',
    num: 8022,
    client: 'Roberto Dias',
    date: '2023-11-04',
    value: 12000,
    status: 'Signed',
  },
  {
    id: 'c3',
    num: 8021,
    client: 'Ana Costa',
    date: '2023-11-02',
    value: 3800,
    status: 'Completed',
  },
  { id: 'c4', num: 8020, client: 'Carlos Silva', date: '2023-11-01', value: 4100, status: 'Draft' },
  {
    id: 'c5',
    num: 8019,
    client: 'Família Souza',
    date: '2023-10-28',
    value: 5500,
    status: 'Cancelled',
  },
]

export const mockStock: StockItem[] = [
  { id: 's1', name: 'Refrigerante Cola 2L', category: 'Bebidas', qty: 45, minQty: 50 },
  { id: 's2', name: 'Copo Descartável 200ml', category: 'Descartáveis', qty: 1200, minQty: 1000 },
  { id: 's3', name: 'Salgadinho Coxinha (cento)', category: 'Comida', qty: 15, minQty: 20 },
  { id: 's4', name: 'Bala de Coco', category: 'Doces', qty: 80, minQty: 30 },
  { id: 's5', name: 'Guardanapo Papel', category: 'Descartáveis', qty: 150, minQty: 500 },
]

export const mockFreelancers: Freelancer[] = [
  {
    id: 'f1',
    name: 'João Souza',
    role: 'Monitor Kids',
    phone: '(11) 98888-1111',
    status: 'Available',
  },
  { id: 'f2', name: 'Carla Dias', role: 'Garçonete', phone: '(11) 97777-2222', status: 'Busy' },
  {
    id: 'f3',
    name: 'Marcos Paulo',
    role: 'Segurança',
    phone: '(11) 96666-3333',
    status: 'Offline',
  },
  {
    id: 'f4',
    name: 'Aline Barros',
    role: 'Recepcionista',
    phone: '(11) 95555-4444',
    status: 'Available',
  },
]

export const mockActivities: Activity[] = [
  {
    id: 'a1',
    action: 'Contrato #8023 assinado',
    user: 'Seller Maria',
    time: '10 min atrás',
    type: 'sale',
  },
  {
    id: 'a2',
    action: 'Lead "Festa da Duda" movido p/ Visita',
    user: 'Seller João',
    time: '1 hora atrás',
    type: 'sale',
  },
  {
    id: 'a3',
    action: 'Alerta: Estoque de Refrigerante baixo',
    user: 'Sistema',
    time: '2 horas atrás',
    type: 'system',
  },
  {
    id: 'a4',
    action: 'Evento "Aniversário Leo" finalizado',
    user: 'Manager Carlos',
    time: 'Ontem',
    type: 'event',
  },
]
