import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { MongoClient, ObjectId } from 'mongodb';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

interface StorePrice {
  price: number;
  url: string;
  lastUpdate: Date;
}

interface Prices {
  amazon?: StorePrice;
  kabum?: StorePrice;
  magalu?: StorePrice;
  terabyte?: StorePrice;
  pichau?: StorePrice;
}

interface Product {
  _id: ObjectId;
  name: string;
  slug: string;
  prices: Prices;
}

interface Lead {
  _id: ObjectId;
  phone: string;
  productId: ObjectId;
  targetPrice: number;
  lastNotified?: Date;
}

async function checkPricesAndNotify() {
  // Conectar ao MongoDB
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('test');
    const leadsCollection = db.collection('leads');
    const productsCollection = db.collection('comparisonproducts');

    // Inicializar WhatsApp Web
    console.log('Iniciando WhatsApp Web...');
    
    const whatsapp = new Client({
      authStrategy: new LocalAuth({
        clientId: 'price-alerts',
        dataPath: './whatsapp-auth'
      }),
      puppeteer: {
        args: ['--no-sandbox'],
        headless: 'new'
      }
    });

    console.log('Aguardando conexão do WhatsApp...');

    whatsapp.on('auth_failure', msg => {
      console.error('Falha na autenticação:', msg);
    });

    whatsapp.on('disconnected', (reason) => {
      console.log('Cliente desconectado:', reason);
    });

    process.on('SIGINT', async () => {
      console.log('Encerrando...');
      await whatsapp.destroy();
      await client.close();
      process.exit();
    });

    whatsapp.on('qr', (qr) => {
      console.log('\n=========================');
      console.log('ESCANEIE O QR CODE ABAIXO');
      console.log('=========================\n');
      qrcode.generate(qr, { small: true });
    });

    whatsapp.on('loading_screen', (percent, message) => {
      console.log('Carregando WhatsApp:', percent, '%', message);
    });

    whatsapp.on('authenticated', () => {
      console.log('WhatsApp autenticado!');
    });

    whatsapp.on('ready', async () => {
      console.log('WhatsApp Web conectado!');
      console.log('Iniciando verificação de preços...');

      try {
        // Buscar todos os leads com targetPrice
        const leads = await leadsCollection.find({
          targetPrice: { $exists: true }
        }).toArray() as Lead[];
        
        console.log(`Encontrados ${leads.length} leads para verificar`);

        console.log(`Verificando ${leads.length} alertas...`);

        for (const lead of leads) {
          // Buscar o produto
          console.log(`\nVerificando lead para o telefone ${lead.phone}...`);
          const product = await productsCollection.findOne({ _id: lead.productId }) as Product | null;
          if (!product) {
            console.log(`Produto não encontrado para o lead ${lead._id}`);
            continue;
          }

          // Calcular preço atual
          console.log('Produto encontrado:', product.name);
          const validPrices = Object.values(product.prices || {})
            .filter(store => store && store.price && store.price > 0)
            .map(store => store.price);
          const currentPrice = validPrices.length > 0
            ? Math.min(...validPrices)
            : null;
          
          console.log('Preço atual:', currentPrice);
          console.log('Preço alvo:', lead.targetPrice);

          if (!currentPrice) {
            console.log(`Produto ${product._id} sem preço disponível`);
            continue;
          }

          // Verificar se o preço baixou
          if (currentPrice < lead.targetPrice) {
            // Verificar se já notificamos nas últimas 24 horas
            const lastNotified = lead.lastNotified ? new Date(lead.lastNotified) : null;
            const hoursSinceLastNotification = lastNotified 
              ? (Date.now() - lastNotified.getTime()) / (1000 * 60 * 60)
              : 999;

            if (hoursSinceLastNotification >= 24) {
              // Formatar mensagem
              const message = 
`*Alerta de Preço* 🔔

O produto que você está acompanhando teve uma queda de preço!

*${product.name}*

Preço quando você cadastrou: R$ ${lead.targetPrice.toFixed(2)}
Preço atual: R$ ${currentPrice.toFixed(2)}
Economia: R$ ${(lead.targetPrice - currentPrice).toFixed(2)}

Confira em: ${process.env.NEXT_PUBLIC_APP_URL}/produtos/${product.slug}`;

              try {
                // Enviar mensagem
                const formattedPhone = lead.phone.replace(/[^0-9]/g, '');
                const chatId = `55${formattedPhone}@c.us`;
                
                console.log(`Enviando mensagem para ${chatId}...`);
                const sent = await whatsapp.sendMessage(chatId, message);
                
                if (sent) {
                  console.log(`✅ Mensagem enviada com sucesso para ${lead.phone}`);
                  // Atualizar lastNotified
                  await leadsCollection.updateOne(
                    { _id: lead._id },
                    { $set: { lastNotified: new Date() } }
                  );
                } else {
                  console.error(`❌ Falha ao enviar mensagem para ${lead.phone}`);
                }
              } catch (error) {
                console.error(`❌ Erro ao enviar mensagem para ${lead.phone}:`, error);
              }
            } else {
              console.log(`Aguardando 24h desde a última notificação para ${lead.phone}`);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao processar alertas:', error);
      } finally {
        console.log('Processamento concluído');
        await client.close();
        process.exit(0);
      }
    });

    whatsapp.initialize();

  } catch (error) {
    console.error('Erro:', error);
    await client.close();
    process.exit(1);
  }
}

checkPricesAndNotify();
