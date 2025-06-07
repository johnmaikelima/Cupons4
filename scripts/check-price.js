require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const uri = process.env.MONGODB_URI;

async function checkPrices() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db();
    const leadsCollection = db.collection('leads');
    const productsCollection = db.collection('comparisonproducts');

    // Buscar leads com targetPrice
    const leads = await leadsCollection.find({
      targetPrice: { $exists: true }
    }).toArray();

    console.log(`\nEncontrados ${leads.length} leads para verificar`);

    for (const lead of leads) {
      console.log(`\nVerificando lead: ${lead.phone}`);
      
      // Buscar produto
      const product = await productsCollection.findOne({
        _id: new ObjectId(lead.productId)
      });

      if (!product) {
        console.log('Produto não encontrado');
        continue;
      }

      console.log('Produto:', product.name);

      // Calcular preço atual
      if (!product.prices) {
        console.log('Produto sem preços');
        continue;
      }

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

      console.log('Preço atual:', currentPrice);
      console.log('Preço alvo:', lead.targetPrice);

      // Se o preço atual for menor que o alvo
      if (currentPrice < lead.targetPrice) {
        console.log('ALERTA! Preço menor que o alvo!');
        
        // Verificar última notificação
        const now = new Date();
        const lastNotified = lead.lastNotified ? new Date(lead.lastNotified) : null;
        const horasSemNotificar = lastNotified 
          ? (now.getTime() - lastNotified.getTime()) / (1000 * 60 * 60)
          : 24;

        if (horasSemNotificar >= 24) {
          console.log('Enviando notificação...');

          // Inicializar WhatsApp
          const whatsapp = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
              args: ['--no-sandbox']
            }
          });

          whatsapp.on('qr', (qr) => {
            console.log('QR Code recebido:');
            qrcode.generate(qr, { small: true });
          });

          whatsapp.on('ready', async () => {
            console.log('WhatsApp conectado!');

            try {
              // Formatar mensagem
              const economia = lead.targetPrice - currentPrice;
              const message = `🎉 Boa notícia! O produto que você está interessado baixou de preço!\n\n` +
                `*${product.name}*\n` +
                `Preço anterior: R$ ${lead.targetPrice.toFixed(2)}\n` +
                `Preço atual: R$ ${currentPrice.toFixed(2)} ${lowestStore ? `(${lowestStore[0]})` : ''}\n` +
                `Economia: R$ ${economia.toFixed(2)}\n\n` +
                `Confira em: ${process.env.NEXT_PUBLIC_APP_URL}/comparacao-de-preco/${product.slug}`;

              // Enviar mensagem
              const chatId = lead.phone.replace(/[^0-9]/g, '') + '@c.us';
              await whatsapp.sendMessage(chatId, message);
              console.log('Mensagem enviada com sucesso!');

              // Atualizar última notificação
              await leadsCollection.updateOne(
                { _id: lead._id },
                { $set: { lastNotified: now } }
              );

              // Fechar WhatsApp
              await whatsapp.destroy();

            } catch (error) {
              console.error('Erro ao enviar mensagem:', error);
            }
          });

          // Iniciar cliente WhatsApp
          await whatsapp.initialize();
        } else {
          console.log(`Última notificação foi há ${horasSemNotificar.toFixed(1)} horas. Aguardando 24h...`);
        }
      } else {
        console.log('Preço ainda não baixou o suficiente');
      }
    }

  } finally {
    await client.close();
    console.log('\nProcessamento concluído');
  }
}

checkPrices().catch(console.error);
