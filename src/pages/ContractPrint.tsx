import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export default function ContractPrint() {
  const { id } = useParams()
  const [contract, setContract] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [childrenList, setChildrenList] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const c = await pb.collection('contracts').getOne(id!, {
          expand: 'lead_id,birthday_person_id,menu_id,decoration_supplier_id',
        })
        setContract(c)

        const p = await pb.collection('payments').getFullList({
          filter: `contract_id = '${id}'`,
          sort: 'due_date',
        })
        setPayments(p)

        let chList: any[] = []
        if (c.expand?.birthday_person_id) {
          chList = Array.isArray(c.expand.birthday_person_id)
            ? c.expand.birthday_person_id
            : [c.expand.birthday_person_id]
        }

        if (chList.length === 0 && c.lead_id) {
          const leadCh = await pb.collection('children').getFullList({
            filter: `lead_id = '${c.lead_id}'`,
          })
          chList = leadCh
        }
        setChildrenList(chList)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  if (loading) return <div className="p-8">Carregando contrato...</div>
  if (!contract) return <div className="p-8">Contrato não encontrado.</div>

  const lead = contract.expand?.lead_id

  const getAgeAtParty = (birthdayStr: string, eventDateStr: string) => {
    if (!birthdayStr || !eventDateStr) return ''
    const b = new Date(birthdayStr)
    const p = new Date(eventDateStr.split(' ')[0])
    if (!isNaN(b.getTime()) && !isNaN(p.getTime())) {
      let age = p.getFullYear() - b.getFullYear()
      const m = p.getMonth() - b.getMonth()
      if (m < 0 || (m === 0 && p.getDate() < b.getDate())) {
        age--
      }
      return Math.max(0, age).toString()
    }
    return ''
  }

  const getDayOfWeek = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr.split(' ')[0] + 'T12:00:00')
    if (isNaN(date.getTime())) return ''
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return days[date.getDay()]
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split(' ')[0].split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:py-0 print:p-0 flex flex-col items-center">
      <div className="flex justify-end mb-4 print:hidden w-[210mm]">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" />
          Export to PDF / Imprimir
        </Button>
      </div>

      <div className="w-[210mm] bg-white shadow-lg print:shadow-none p-8 print:p-0 text-black text-[12px] font-sans">
        <div className="flex justify-between items-center mb-4">
          <div className="w-40 font-bold text-green-600 text-2xl leading-none">
            Tribo <br />
            <span className="text-xs text-black font-normal">da Folia</span>
          </div>
          <h1 className="text-[16px] font-bold uppercase">Contrato de Prestação de Serviço</h1>
          <div className="text-right w-40">
            <p className="text-red-600 font-bold text-sm">
              Nº Contrato:{' '}
              {contract.contract_number ? contract.contract_number.replace('CTR-', '') : ''}
            </p>
            <p className="text-[10px] font-bold">Prime Sexta e véspera de feriado.</p>
          </div>
        </div>

        <div className="border border-black">
          <div className="flex border-b border-black text-[11px] bg-gray-50 print:bg-white">
            <div className="flex-1 border-r border-black p-2 font-bold flex items-center">
              DATA DA FESTA:{' '}
              <span className="font-normal ml-1">
                {formatDate(contract.event_date)} {getDayOfWeek(contract.event_date)}
              </span>
            </div>
            <div className="flex-1 border-r border-black p-2 font-bold flex items-center">
              HORÁRIO:{' '}
              <span className="font-normal ml-1">
                {contract.event_start_time} | {contract.event_end_time}
              </span>
            </div>
            <div className="flex-1 border-r border-black p-2 font-bold flex items-center">
              CONVIDADOS: <span className="font-normal ml-1">{contract.guest_count}</span>
            </div>
            <div className="flex-1 p-2 font-bold flex items-center">
              SALÃO: <span className="font-normal ml-1">{contract.salon}</span>
            </div>
          </div>

          {childrenList.map((child, idx) => (
            <div className="flex border-b border-black text-[11px]" key={child.id || idx}>
              <div className="w-1/2 border-r border-black p-2">
                <span className="font-bold">Aniversariante:</span> {child.name}
              </div>
              <div className="w-1/2 p-2">
                <span className="font-bold">Data de Nascimento:</span> {formatDate(child.birthday)}{' '}
                | <span className="font-bold">Idade na Festa:</span>{' '}
                {getAgeAtParty(child.birthday, contract.event_date)}
              </div>
            </div>
          ))}

          <div className="flex border-b border-black text-[11px]">
            <div className="w-1/2 border-r border-black p-2">
              <span className="font-bold">Responsavel 1:</span> {lead?.name} | {lead?.phone}
            </div>
            <div className="w-1/2 p-2">
              <span className="font-bold">Responsavel 2:</span> {lead?.spouse_name || ''}{' '}
              {lead?.spouse_name && lead?.phone2 ? '|' : ''} {lead?.phone2 || ''}
            </div>
          </div>

          <div className="flex border-b border-black text-[11px]">
            <div className="w-1/2 border-r border-black p-2">
              <span className="font-bold">E-mail:</span> {lead?.email}
            </div>
            <div className="w-1/2 p-2">
              <span className="font-bold">E-mail 2:</span> {lead?.email2 || ''}
            </div>
          </div>

          <div className="flex border-b border-black text-[11px]">
            <div className="w-1/2 border-r border-black p-2">
              <span className="font-bold">Tema da Festa:</span>{' '}
              {contract.theme_notes || 'A definir'}
            </div>
            <div className="w-1/2 p-2">
              <span className="font-bold">Fornecedor:</span>{' '}
              {contract.expand?.decoration_supplier_id?.name || 'Vem de fora'}
            </div>
          </div>

          <div className="p-1 border-b border-black text-[10px] text-red-600 font-bold leading-tight text-center">
            A mesa de decoração é um serviço prestado por empresas terceirizadas, sendo necessário
            constatar a sua disponibilidade, havendo diferentes valores adicionais de acordo com
            tema e a empresa escolhida.
          </div>

          <div className="flex border-b border-black text-[10px]">
            <div className="w-1/5 border-r border-black p-2">
              <span className="font-bold uppercase block mb-1">Bolo:</span>{' '}
              {contract.cake_notes || 'N/A'}
            </div>
            <div className="w-1/5 border-r border-black p-2">
              <span className="font-bold uppercase block mb-1">Festa com Alcool:</span>{' '}
              {contract.has_alcohol ? 'Sim' : 'Não'}
            </div>
            <div className="w-3/5 p-2">
              <span className="font-bold uppercase block mb-1">Almoço ou Jantar:</span>{' '}
              {contract.expand?.menu_id?.name || ''}{' '}
              {contract.expand?.menu_id?.description
                ? `- ${contract.expand.menu_id.description}`
                : ''}
            </div>
          </div>

          <div className="border-b border-black p-2 text-[11px]">
            <span className="font-bold">Observação:</span>{' '}
            {contract.notes || contract.payment_notes || 'Nenhuma observação.'}
          </div>

          <div className="p-2 text-[11px]">
            <span className="font-bold">Cortesias:</span>{' '}
            {contract.courtesies || 'Nenhuma cortesia registrada.'}
          </div>
        </div>

        <div className="font-bold mt-4 mb-2 text-[12px] uppercase">Dados do Pagamento</div>

        <div className="flex border border-black mb-2 text-[11px] bg-gray-50 print:bg-white">
          <div className="w-1/2 border-r border-black p-2 font-bold">
            TOTAL: {formatCurrency(contract.total_value)}
          </div>
          <div className="w-1/2 p-2 font-bold">
            TIPO / FORMA DE PAGAMENTO (Previsto): {contract.payment_method || 'A combinar'}
          </div>
        </div>

        <p className="text-[10px] text-justify leading-tight mb-2">
          Parcelamento direto com a Contratada em dinheiro ou através de depósitos bancários,
          deverão ser efetuados mensalmente, no vencimento combinado. O contrato deverá ser quitado
          em sua forma integral com 10 dias de antecedência de sua realização.{' '}
          <strong>Parcelamento pós-evento somente será aceito através de cartão de crédito.</strong>{' '}
          A contratada não efetuará devolução de valores caso não compareçam todos os convidados
          neste contrato. A forma de pagamento fica acordada da seguinte forma:
        </p>

        <div className="border border-black">
          <table className="w-full border-collapse text-center text-[11px]">
            <thead>
              <tr className="font-bold border-b border-black bg-gray-50 print:bg-white">
                <th className="border-r border-black p-1.5 w-1/4">Tipo</th>
                <th className="border-r border-black p-1.5 w-1/4">Valor</th>
                <th className="border-r border-black p-1.5 w-1/4">Data</th>
                <th className="p-1.5 w-1/4">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any, idx: number) => (
                <tr
                  key={p.id || idx}
                  className={idx < payments.length - 1 ? 'border-b border-black' : ''}
                >
                  <td className="border-r border-black p-1.5">
                    {p.payment_method || contract.payment_method}
                  </td>
                  <td className="border-r border-black p-1.5">{formatCurrency(p.amount)}</td>
                  <td className="border-r border-black p-1.5">{formatDate(p.due_date)}</td>
                  <td className="p-1.5">
                    {p.status === 'Pending' ? 'Pendente' : p.status === 'Paid' ? 'Pago' : p.status}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-2 text-gray-500">
                    Nenhuma parcela registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border border-black border-t-0 text-center p-2 mb-4 text-[10px] leading-tight bg-gray-50 print:bg-white">
          <strong className="block mb-1 text-[11px]">Dados Bancários para depósitos</strong>
          {contract.bank_details ? (
            <div
              dangerouslySetInnerHTML={{ __html: contract.bank_details.replace(/\n/g, '<br />') }}
            />
          ) : (
            <>
              <strong>Banco do Brasil:</strong> Ag.: 0300-X C/C.: 127722-7 |{' '}
              <strong>Banco Itaú:</strong> Ag.: 7646 C/C.: 55443-1 |{' '}
              <strong>Banco Santander:</strong> Ag.: 0915 C/C.: 13000535-8
              <br />
              <strong>PIX CNPJ 10.368.886/0001-84</strong> | Tribo da Folia Festas e Eventos Eireli
              - CNPJ 10.368.886/0001-84
              <br />
              <strong>
                OBS: Após efetuar transferência envie comprovante para:{' '}
                <u className="text-blue-600">festa@tribodafolia.com.br</u> ou WhatsApp: (11)
                99518-6838
              </strong>
            </>
          )}
        </div>

        <div className="text-[10px] text-justify space-y-2 leading-tight mt-6">
          <p>
            Pelo presente instrumento, os signatários: Contratante e a Contratada, têm entre si,
            justo e acordado as seguintes normas de contrato, as quais mutuamente outorgam e aceitam
            a saber que ficam denominadas: Contratada: Tribo da Folia Festas e Eventos Eireli,
            CNPJ.: 10.368.886/0001-84, situada na Av. SUPLICY, 708 / 734 - Jardim Santa Mena -
            Guarulhos - SP - CEP.: 07196-000 e do outro lado como: <strong>{lead?.name}</strong>,
            RG: {lead?.rg || '_________________'} e CPF: {lead?.cpf || '_________________'} com
            endereço Rua {lead?.address_street || '_________________'},{' '}
            {lead?.address_number || '___'} - Bairro:{' '}
            {lead?.address_neighborhood || '_________________'} - CEP:{' '}
            {lead?.address_zip || '_________'} - {lead?.address_city || '_________________'}.
          </p>
          <p>
            A Contratada se obriga a reservar o seu salão para Nº .: {contract.guest_count}{' '}
            convidados, no dia {formatDate(contract.event_date)} pelo valor de:{' '}
            {formatCurrency(contract.total_value)} pelo período de 4 horas (
            {contract.event_start_time} | {contract.event_end_time}), a contratada disponibiliza 30
            minutos de tolerância, este período extra serve para a desocupação do espaço, não mais
            havendo serviços de buffet. Ultrapassado o período de 30 minutos, será cobrado o valor
            integral da hora, tendo com base de cálculo um quarto do valor do contrato. A contratada
            garante a qualidade de seus serviços, salvo se a quantidade de convidados presente em
            lista, exceda 15% da quantidade contratada, qualquer alteração no contrato dependerá da
            concordância e da disponibilidade em agenda, podendo implicar em alteração no valor
            pactuado. A contratada prestará os serviços de acordo com o Cardápio escolhido, o qual
            fica fazendo parte integrante deste contrato, podendo excluir ou substituir a qualquer
            momento seus itens sem qualquer aviso prévio. Crianças até 5 anos não pagam.
          </p>
        </div>

        <div className="flex justify-between pt-16 pb-4 px-8 mt-8">
          <div className="text-center w-[40%] border-t border-black pt-1">
            <p className="font-bold">{lead?.name}</p>
            <p>Contratante (CPF: {lead?.cpf || '_________________'})</p>
          </div>
          <div className="text-center w-[40%] border-t border-black pt-1">
            <p className="font-bold">Tribo da Folia Festas e Eventos Eireli</p>
            <p>Contratada (CNPJ: 10.368.886/0001-84)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
