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
  const child = contract.expand?.birthday_person_id
  const menu = contract.expand?.menu_id

  let ageAtParty = ''
  if (child?.birthday && contract.event_date) {
    const b = new Date(child.birthday)
    const p = new Date(contract.event_date.split(' ')[0])
    if (!isNaN(b.getTime()) && !isNaN(p.getTime())) {
      let age = p.getFullYear() - b.getFullYear()
      const m = p.getMonth() - b.getMonth()
      if (m < 0 || (m === 0 && p.getDate() < b.getDate())) {
        age--
      }
      ageAtParty = Math.max(0, age).toString()
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split(' ')[0].split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none p-8 text-black text-[12px] font-sans print:p-0">
        <div className="flex justify-end mb-4 print:hidden">
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            Export to PDF / Imprimir
          </Button>
        </div>

        <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
          <div className="w-32 font-bold text-green-600 text-2xl leading-none">
            Tribo <br />
            <span className="text-xs text-black font-normal">da Folia</span>
          </div>
          <h1 className="text-lg font-bold">CONTRATO DE PRESTAÇÃO DE SERVIÇO</h1>
          <div className="text-right">
            <p className="text-red-600 font-bold text-base">
              Nº Contrato: {contract.contract_number.replace('CTR-', '')}
            </p>
            <p className="text-[10px]">Prime Sexta e véspera de feriado.</p>
          </div>
        </div>

        <div className="border border-black mb-2 flex">
          <div className="flex-1 border-r border-black p-1 flex font-bold items-center">
            DATA DA FESTA:{' '}
            <span className="font-normal ml-1">{formatDate(contract.event_date)}</span>
          </div>
          <div className="flex-1 border-r border-black p-1 flex font-bold items-center">
            HORÁRIO:{' '}
            <span className="font-normal ml-1">
              {contract.event_start_time} | {contract.event_end_time}
            </span>
          </div>
          <div className="flex-1 border-r border-black p-1 flex font-bold items-center">
            CONVIDADOS: <span className="font-normal ml-1">{contract.guest_count}</span>
          </div>
          <div className="flex-1 p-1 flex font-bold items-center">
            SALÃO: <span className="font-normal ml-1">{contract.salon}</span>
          </div>
        </div>

        <div className="border border-black mb-2">
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-1">
              <span className="font-bold">Aniversariante:</span> {child?.name || 'N/A'}
            </div>
            <div className="flex-1 p-1">
              <span className="font-bold">Data de Nascimento:</span> {formatDate(child?.birthday)} |{' '}
              <span className="font-bold">Idade na Festa:</span> {ageAtParty}
            </div>
          </div>

          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-1">
              <span className="font-bold">Responsavel 1:</span> {lead?.name} | {lead?.phone}
            </div>
            <div className="flex-1 p-1">
              <span className="font-bold">Responsavel 2:</span> {lead?.spouse_name || 'N/A'} |{' '}
              {lead?.phone2 || 'N/A'}
            </div>
          </div>

          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-1">
              <span className="font-bold">E-mail:</span> {lead?.email}
            </div>
            <div className="flex-1 p-1">
              <span className="font-bold">E-mail 2:</span>
            </div>
          </div>

          <div className="flex">
            <div className="flex-1 border-r border-black p-1">
              <span className="font-bold">Tema da Festa:</span>{' '}
              {contract.theme_notes || 'A definir'}
            </div>
            <div className="flex-1 p-1">
              <span className="font-bold">Fornecedor:</span>{' '}
              {contract.expand?.decoration_supplier_id?.name || 'Vem de fora'}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-red-600 font-bold mb-2 text-justify leading-tight">
          A mesa de decoração é um serviço prestado por empresas terceirizadas, sendo necessário
          constatar a sua disponibilidade, havendo diferentes valores adicionais de acordo com tema
          e a empresa escolhida.
        </p>

        <div className="border border-black flex mb-2">
          <div className="w-1/4 border-r border-black p-1">
            <span className="font-bold block">BOLO:</span>
            {contract.cake_notes || 'N/A'}
          </div>
          <div className="w-1/4 border-r border-black p-1">
            <span className="font-bold block">FESTA COM ALCOOL:</span>
            {contract.has_alcohol ? 'Sim' : 'Não'}
          </div>
          <div className="w-2/4 p-1">
            <span className="font-bold block">ALMOÇO OU JANTAR:</span>
            {menu?.name}
          </div>
        </div>

        <div className="border border-black p-1 mb-2">
          <span className="font-bold">Observação:</span>{' '}
          {contract.notes || contract.payment_notes || 'Nenhuma'}
        </div>

        <div className="border border-black p-1 mb-4">
          <span className="font-bold">Cortesias:</span> {contract.courtesies || 'Nenhuma'}
        </div>

        {contract.items_breakdown && contract.items_breakdown.length > 0 && (
          <>
            <h2 className="font-bold mb-1">COMPOSIÇÃO DO VALOR</h2>
            <table className="w-full border-collapse border border-black text-center mb-2">
              <thead>
                <tr>
                  <th className="border border-black p-1 w-1/2">Item</th>
                  <th className="border border-black p-1 w-1/4">Status</th>
                  <th className="border border-black p-1 w-1/4">Valor</th>
                </tr>
              </thead>
              <tbody>
                {contract.items_breakdown.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border border-black p-1">{item.name}</td>
                    <td className="border border-black p-1">{item.status}</td>
                    <td className="border border-black p-1">{formatCurrency(item.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <h2 className="font-bold mb-1">DADOS DO PAGAMENTO</h2>
        <div className="border border-black flex mb-2 font-bold bg-gray-50 print:bg-white">
          <div className="flex-1 border-r border-black p-2">
            TOTAL: {formatCurrency(contract.total_value)}
          </div>
          <div className="flex-1 p-2">
            TIPO / FORMA DE PAGAMENTO (Previsto): {contract.payment_method}
          </div>
        </div>

        <p className="text-[10px] mb-2 text-justify leading-tight">
          Parcelamento direto com a Contratada em dinheiro ou através de depósitos bancários,
          deverão ser efetuados mensalmente, no vencimento combinado. O contrato deverá ser quitado
          em sua forma integral com 10 dias de antecedência de sua realização.{' '}
          <strong>Parcelamento pós-evento somente será aceito através de cartão de crédito.</strong>{' '}
          A contratada não efetuará devolução de valores caso não compareçam todos os convidados
          neste contrato. A forma de pagamento fica acordada da seguinte forma:
        </p>

        <table className="w-full border-collapse border border-black text-center mb-2">
          <thead>
            <tr>
              <th className="border border-black p-1 w-1/4">Tipo</th>
              <th className="border border-black p-1 w-1/4">Valor</th>
              <th className="border border-black p-1 w-1/4">Data</th>
              <th className="border border-black p-1 w-1/4">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p: any, idx: number) => (
              <tr key={p.id || idx}>
                <td className="border border-black p-1">
                  {p.payment_method || contract.payment_method}
                </td>
                <td className="border border-black p-1">{formatCurrency(p.amount)}</td>
                <td className="border border-black p-1">{formatDate(p.due_date)}</td>
                <td className="border border-black p-1">
                  {p.status === 'Pending' ? 'Pendente' : 'Pago'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border border-black text-center p-2 mb-4 text-[10px] leading-tight bg-gray-50 print:bg-white">
          <strong className="block mb-1">Dados Bancários para depósitos</strong>
          {contract.bank_details ? (
            <div
              dangerouslySetInnerHTML={{ __html: contract.bank_details.replace(/\n/g, '<br />') }}
            />
          ) : (
            <>
              Banco do Brasil: Ag.: 0300-X C/C.: 127722-7 | Banco Itaú: Ag.: 7646 C/C.: 55443-1 |
              Banco Santander: Ag.: 0915 C/C.: 13000535-8
              <br />
              PIX CNPJ 10.368.886/0001-84 | Tribo da Folia Festas e Eventos Eireli - CNPJ
              10.368.886/0001-84
              <br />
              OBS: Após efetuar transferência envie comprovante para:{' '}
              <u>festa@tribodafolia.com.br</u> ou WhatsApp: (11) 99518-6838
            </>
          )}
        </div>

        <div className="text-[9px] text-justify space-y-2 leading-tight mt-4">
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
            <strong>CLÁUSULA PRIMEIRA - DO OBJETO:</strong> A Contratada se obriga a reservar o seu
            salão para {contract.guest_count} convidados, no dia {formatDate(contract.event_date)}{' '}
            pelo valor de: {formatCurrency(contract.total_value)} pelo período de 4 horas (
            {contract.event_start_time} às {contract.event_end_time}). A contratada disponibiliza 30
            minutos de tolerância para desocupação do espaço, sem serviços de buffet. Ultrapassado
            este período, será cobrado o valor integral de uma hora extra (25% do valor do
            contrato). A contratada prestará os serviços conforme Cardápio escolhido, que integra
            este contrato, podendo substituir itens por motivo de força maior. Crianças até 5 anos
            (incompletos) não pagam.
          </p>
          <p>
            <strong>CLÁUSULA SEGUNDA - CANCELAMENTO:</strong> Em caso de desistência ou rescisão por
            parte da Contratante, não haverá devolução dos valores pagos, que serão retidos a título
            de multa rescisória e ressarcimento por perdas e danos (reserva de data). Caso o evento
            seja remarcado, haverá incidência de taxa de alteração de data no valor de 20% do
            contrato, mediante disponibilidade da Contratada.
          </p>
          <p>
            <strong>CLÁUSULA TERCEIRA - REGRAS E SEGURANÇA:</strong> É expressamente proibido colar,
            perfurar ou fixar qualquer tipo de material nas paredes, móveis e equipamentos do salão.
            Danos causados por convidados ou equipe terceirizada contratada pela Contratante serão
            cobrados integralmente. A Contratada não se responsabiliza por objetos deixados no
            local.
          </p>
          <p>
            <strong>CLÁUSULA QUARTA - USO DE IMAGEM:</strong> A Contratante autoriza, a título
            gratuito, o uso de imagens (fotos e vídeos) realizadas durante o evento nas redes
            sociais e materiais promocionais da Contratada. Caso não deseje, a Contratante deverá
            comunicar por escrito antes da realização do evento.
          </p>
          <div className="flex justify-between pt-12 pb-4 px-8 mt-8">
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
    </div>
  )
}
