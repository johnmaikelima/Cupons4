import { connectDB } from '../src/lib/mongodb';
import { Lead } from '../src/models/Lead';
import { ComparisonProduct } from '../src/models/ComparisonProduct';

async function getBestPrice(product: any) {
  try {
    // Buscar preços da Amazon
    const amazonResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/amazon-comparison/${product.ean}`
    );
    const amazonData = await amazonResponse.json();
    
    // Combinar todos os preços
    const allPrices = [
      ...(product.prices || []),
      ...(amazonData.price ? [amazonData.price] : [])
    ];

    // Calcular o melhor preço
    return allPrices.length > 0
      ? allPrices.reduce((min: number, p: any) => p.price < min ? p.price : min, allPrices[0].price)
      : null;
  } catch (error) {
    console.error(`Erro ao buscar preço para produto ${product.name}:`, error);
    return null;
  }
}

async function sendWhatsAppNotification(phone: string, message: string) {
  try {
    // Aqui você deve integrar com sua API de WhatsApp
    // Por exemplo, usando a API oficial do WhatsApp Business
    const response = await fetch('sua-api-whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify({
        phone,
        message
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar mensagem WhatsApp');
    }

    return true;
  } catch (error) {
    console.error('Erro ao enviar notificação WhatsApp:', error);
    return false;
  }
}

async function checkPriceAlerts() {
  try {
    await connectDB();

    // Buscar todos os alertas ativos
    const leads = await Lead.find()
      .populate({
        path: 'productId',
        model: ComparisonProduct
      });

    console.log(`Verificando ${leads.length} alertas de preço...`);

    for (const lead of leads) {
      const product = lead.productId;
      
      // Pular se o produto não existe mais
      if (!product) {
        console.log(`Produto não encontrado para o alerta ${lead._id}`);
        continue;
      }

      // Buscar o melhor preço atual
      const currentPrice = await getBestPrice(product);
      
      // Se não conseguimos obter o preço, pular
      if (!currentPrice) {
        console.log(`Não foi possível obter o preço para ${product.name}`);
        continue;
      }

      // Se o preço atual é menor que o preço alvo
      if (currentPrice < lead.targetPrice) {
        // Verificar se já notificamos recentemente (últimas 24h)
        const lastNotified = lead.lastNotified ? new Date(lead.lastNotified) : new Date(0);
        const hoursSinceLastNotification = (Date.now() - lastNotified.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastNotification >= 24) {
          // Preparar mensagem
          const message = `🔔 Alerta de Preço!\n\n` +
            `O produto "${product.name}" está mais barato!\n\n` +
            `Preço anterior: R$ ${lead.targetPrice.toFixed(2)}\n` +
            `Preço atual: R$ ${currentPrice.toFixed(2)}\n` +
            `Economia: R$ ${(lead.targetPrice - currentPrice).toFixed(2)}\n\n` +
            `Veja agora: ${process.env.NEXT_PUBLIC_URL}/produtos/${product.slug}`;

          // Enviar notificação
          const sent = await sendWhatsAppNotification(lead.phone, message);

          if (sent) {
            // Atualizar o preço alvo e a data da última notificação
            lead.targetPrice = currentPrice;
            lead.lastNotified = new Date();
            await lead.save();

            console.log(`Notificação enviada para ${lead.phone} sobre ${product.name}`);
          }
        }
      }
    }

    console.log('Verificação de alertas concluída!');
  } catch (error) {
    console.error('Erro ao verificar alertas:', error);
  } finally {
    process.exit();
  }
}

// Executar o script
checkPriceAlerts();
