import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, lead_id } = await req.json()

    // Safety check
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message format')
    }

    let aiResponse = ''
    const msgLower = message.toLowerCase()

    // Contextual basic NLP logic to simulate AI without external API keys for the demo
    if (
      msgLower.includes('valor') ||
      msgLower.includes('preço') ||
      msgLower.includes('preco') ||
      msgLower.includes('custa') ||
      msgLower.includes('orçamento')
    ) {
      aiResponse =
        'Nossos pacotes começam em R$ 3.500 para 50 convidados no salão Kids&Teens e R$ 4.500 no salão Premium. O valor inclui cardápio completo, decoração básica, brinquedos e equipe dedicada. Deseja que eu envie uma proposta detalhada por aqui?'
    } else if (
      msgLower.includes('data') ||
      msgLower.includes('dia') ||
      msgLower.includes('disponível') ||
      msgLower.includes('disponivel') ||
      msgLower.includes('agenda')
    ) {
      aiResponse =
        'Temos algumas datas disponíveis nos próximos meses! Nossos horários padrão são almoço (12h-13h) e jantar (19h-20h). Para verificar a disponibilidade de uma data específica, que tal agendarmos uma visita presencial para você conhecer nossos salões?'
    } else if (
      msgLower.includes('cardápio') ||
      msgLower.includes('comida') ||
      msgLower.includes('menu') ||
      msgLower.includes('bebiba')
    ) {
      aiResponse =
        'Nosso cardápio é super completo! Inclui salgados assados e fritos na hora, mini pratos quentes, doces tradicionais, bolo personalizado e bebidas à vontade. Também temos opções especiais para restrições alimentares. Posso te enviar o PDF com todas as opções?'
    } else if (
      msgLower.includes('onde') ||
      msgLower.includes('local') ||
      msgLower.includes('endereço') ||
      msgLower.includes('endereco')
    ) {
      aiResponse =
        'Estamos localizados na Avenida das Festas, 1000 - Centro. Temos estacionamento próprio e fácil acesso. Quando gostaria de vir nos visitar?'
    } else {
      aiResponse = `Entendi! Como assistente virtual inteligente da Tribo da Folia, estou aqui para ajudar a organizar a festa perfeita. Você gostaria de agendar uma visita para conhecer o espaço ou prefere receber nossa tabela de preços e cardápios primeiro?`
    }

    // Adding simulated typing delay for realistic feeling
    await new Promise((resolve) => setTimeout(resolve, 800))

    return new Response(JSON.stringify({ reply: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
