async function testWhatsAppMessage() {
  try {
    // Número de teste fornecido pela Meta
    const testNumber = "558599999999"; // Substitua pelo seu número de teste
    
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: testNumber,
          type: 'text',
          text: { 
            body: "🔔 Teste de Alerta de Preço!\n\nEste é um teste do sistema de notificações do LinkCompra.\n\nSe você recebeu esta mensagem, o sistema está funcionando corretamente!" 
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}\n${JSON.stringify(data, null, 2)}`);
    }

    console.log('Resposta da API:', JSON.stringify(data, null, 2));
    console.log('Mensagem de teste enviada com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste:', error);
  }
}

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

// Executar o teste
testWhatsAppMessage();
