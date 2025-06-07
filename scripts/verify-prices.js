require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

async function verifyPrices() {
  // Conectar ao MongoDB
  const client = new MongoClient(process.env.MONGODB_URI);
  console.log('Conectando ao MongoDB...');
  
  try {
    await client.connect();
    const db = client.db();
    
    // Inicializar WhatsApp
    console.log('Inicializando WhatsApp...');
    const whatsapp = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { args: ['--no-sandbox'] }
    });

    // Handlers do WhatsApp
    whatsapp.on('qr', (qr) => {
      console.log('Escaneie o QR Code:');
      qrcode.generate(qr, { small: true });
    });

    whatsapp.on('ready', async () => {
      console.log('WhatsApp conectado!');
      
      try {
        // Buscar todos os leads
        const leads = await db.collection('leads').find().toArray();
        console.log(`\nVerificando ${leads.length} alertas...`);

        for (const lead of leads) {
          console.log(`\nVerificando alerta para ${lead.phone}...`);
          
          // Buscar produto
          const product = await db.collection('comparisonproducts')
            .findOne({ _id: new ObjectId(lead.productId) });
          
          if (!product || !product.prices) {
            console.log('Produto não encontrado ou sem preços');
            continue;
          }

          // Calcular menor preço atual
          const validPrices = Object.values(product.prices)
            .filter(store => store && store.price && store.price > 0)
            .map(store => store.price);

          if (validPrices.length === 0) {
            console.log('Nenhum preço válido encontrado');
            continue;
          }

          const currentPrice = Math.min(...validPrices);
          const lowestStore = Object.entries(product.prices)
            .find(([_, store]) => store && store.price === currentPrice);
          console.log(`Produto: ${product.name}`);
          console.log(`Preço atual: R$ ${currentPrice}`);
          console.log(`Preço alvo: R$ ${lead.targetPrice}`);

          // Verificar se preço baixou
          if (currentPrice < lead.targetPrice) {
            console.log('ALERTA: Preço mais baixo encontrado!');

            // Verificar última notificação
            const now = new Date();
            const lastNotified = lead.lastNotified ? new Date(lead.lastNotified) : null;
            const horasSemNotificar = lastNotified 
              ? (now - lastNotified) / (1000 * 60 * 60)
              : 24;

            if (horasSemNotificar >= 24) {
              console.log('Enviando notificação...');

              // Formatar mensagem
              const economia = lead.targetPrice - currentPrice;
              const message = 
                `🎉 Boa notícia! O produto que você está interessado baixou de preço!\n\n` +
                `*${product.name}*\n` +
                `Preço anterior: R$ ${lead.targetPrice.toFixed(2)}\n` +
                `Preço atual: R$ ${currentPrice.toFixed(2)} ${lowestStore ? `(${lowestStore[0]})` : ''}\n` +
                `Economia: R$ ${economia.toFixed(2)}\n\n` +
                `Confira em: ${process.env.NEXT_PUBLIC_APP_URL}/produtos/${product.slug}`;

              // Formatar número do WhatsApp
              const phoneNumber = lead.phone.replace(/[^0-9]/g, '');
              const chatId = '55' + phoneNumber + '@c.us'; // Adiciona código do Brasil (55)
              console.log('Enviando para:', chatId);

              try {
                // Verificar se o número existe no WhatsApp
                const numberExists = await whatsapp.isRegisteredUser(chatId);
                if (!numberExists) {
                  console.log('Número não registrado no WhatsApp');
                  continue;
                }

                // Enviar mensagem e aguardar confirmação
                const response = await whatsapp.sendMessage(chatId, message);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Aguarda 5 segundos
                
                const messageStatus = await response.getStatus();
                console.log('Status da mensagem:', messageStatus);

                if (messageStatus === 'sent' || messageStatus === 'delivered') {
                  console.log('Mensagem enviada com sucesso!');
                } else {
                  console.log('Mensagem pode não ter sido entregue. Status:', messageStatus);
                }
              } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
                continue;
              }

              // Atualizar última notificação
              await db.collection('leads').updateOne(
                { _id: lead._id },
                { $set: { lastNotified: now } }
              );
            } else {
              console.log(`Aguardando 24h desde a última notificação (${horasSemNotificar.toFixed(1)}h)`);
            }
          } else {
            console.log('Preço ainda não baixou o suficiente');
          }
        }
      } catch (error) {
        console.error('Erro:', error);
      }

      // Fechar conexões
      await whatsapp.destroy();
      await client.close();
      console.log('\nProcessamento concluído');
    });

    // Iniciar WhatsApp
    await whatsapp.initialize();

  } catch (error) {
    console.error('Erro fatal:', error);
    await client.close();
  }
}

// Executar verificação
verifyPrices();
