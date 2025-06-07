import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/models/User';
import { ComparisonProduct } from '../src/models/ComparisonProduct';
import WhatsAppService from '../src/services/whatsapp';

async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const whatsapp = WhatsAppService.getInstance();
    await whatsapp.sendMessage(to, message);
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${to}:`, error);
  }
}

async function checkPrices() {
  try {
    await connectDB();

    // Buscar usuários com produtos favoritados
    const users = await User.find({
      'favoriteProducts.0': { $exists: true } // Apenas usuários com produtos favoritados
    }).populate('favoriteProducts.productId');

    console.log(`\nVerificando preços de ${users.length} usuários...`);

    for (const user of users) {
      for (const favorite of user.favoriteProducts) {
        const product = favorite.productId;
        
        if (!product) {
          console.log('Produto não encontrado, removendo dos favoritos...');
          user.favoriteProducts = user.favoriteProducts.filter(
            f => f.productId !== favorite.productId
          );
          continue;
        }

        // Se o preço mudou desde a última verificação
        if (product.currentPrice !== favorite.initialPrice) {
          const priceChange = product.currentPrice - favorite.initialPrice;
          const percentageChange = (priceChange / favorite.initialPrice) * 100;
          const isIncrease = priceChange > 0;

          // Template da mensagem
          const message = `🏷️ Atualização de Preço!\n\n` +
            `*${product.name}*\n\n` +
            `${isIncrease ? '📈' : '📉'} O preço ${isIncrease ? 'subiu' : 'baixou'}!\n\n` +
            `💰 Preço anterior: R$ ${favorite.initialPrice.toFixed(2)}\n` +
            `${isIncrease ? '😔' : '🎉'} Preço atual: R$ ${product.currentPrice.toFixed(2)}\n` +
            `${isIncrease ? '📈' : '📉'} ${isIncrease ? 'Aumento' : 'Economia'}: R$ ${Math.abs(priceChange).toFixed(2)} (${Math.abs(percentageChange).toFixed(1)}%)\n\n` +
            `${isIncrease ? '⚠️ O preço aumentou! Recomendamos aguardar uma queda.' : '🎯 Aproveite! O preço está mais baixo que o normal.'}\n\n` +
            `🔗 Ver produto: ${process.env.NEXT_PUBLIC_BASE_URL}/produtos/${product._id}\n\n` +
            `_Enviado por LinkCompra - Seu Assistente de Preços_`;

          // Enviar notificação
          await sendWhatsAppMessage(user.phone, message);
          console.log(`Notificação enviada para ${user.phone} sobre ${product.name}`);

          // Atualizar o preço inicial para o preço atual
          favorite.initialPrice = product.currentPrice;
          favorite.lastNotified = new Date();
          await user.save();
        }
      }
    }

    console.log('\nVerificação de preços concluída!');
  } catch (error) {
    console.error('Erro ao verificar preços:', error);
  }
}

async function startPriceMonitoring() {
  const whatsapp = WhatsAppService.getInstance();

  // Registrar callback para o QR code
  whatsapp.onQRCode((qr) => {
    console.log('\nPor favor, escaneie o QR code acima com seu WhatsApp para conectar.\n');
  });

  // Inicializar o cliente WhatsApp
  console.log('Iniciando cliente WhatsApp...');
  await whatsapp.initialize();

  // Aguardar até que o cliente esteja pronto
  while (!whatsapp.isClientReady()) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Sistema de monitoramento iniciado!');

  // Executar a verificação a cada 30 minutos
  while (true) {
    try {
      await checkPrices();
      console.log('\nAguardando 30 minutos para próxima verificação...');
      await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000));
    } catch (error) {
      console.error('Erro durante a verificação:', error);
      console.log('\nTentando novamente em 5 minutos...');
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
    }
  }
}

// Iniciar o monitoramento
startPriceMonitoring();
