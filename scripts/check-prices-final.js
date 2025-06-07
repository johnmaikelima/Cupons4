require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

async function checkPrices() {
    console.log('Iniciando verificação de preços...');

    // Conectar ao MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Conectado ao MongoDB');

    // Inicializar WhatsApp
    const whatsapp = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['--no-sandbox'],
            headless: true // Modo headless ativado
        }
    });

    whatsapp.on('qr', (qr) => {
        console.log('Escaneie o QR Code:');
        qrcode.generate(qr, { small: true });
    });

    whatsapp.on('ready', async () => {
        console.log('WhatsApp Web conectado!');

        try {
            const db = client.db();
            const leadsCollection = db.collection('leads');
            const productsCollection = db.collection('comparisonproducts');

            // Buscar todos os leads
            const leads = await leadsCollection.find().toArray();
            console.log(`\nVerificando ${leads.length} alertas...`);

            for (const lead of leads) {
                console.log(`\nVerificando alerta para ${lead.phone}...`);

                // Buscar produto
                const product = await productsCollection.findOne({
                    _id: new ObjectId(lead.productId)
                });

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
                console.log(`Produto: ${product.name}`);
                console.log(`Preço atual: R$ ${currentPrice}`);
                console.log(`Preço alvo: R$ ${lead.targetPrice}`);

                // Se o preço atual for menor que o alvo
                if (currentPrice < lead.targetPrice) {
                    console.log('ALERTA: Preço mais baixo encontrado!');

                    try {
                        // Formatar número
                        const phoneNumber = lead.phone.replace(/[^0-9]/g, '');
                        const chatId = '55' + phoneNumber + '@c.us';

                        // Verificar se número existe
                        const isRegistered = await whatsapp.isRegisteredUser(chatId);
                        if (!isRegistered) {
                            console.log('Número não registrado no WhatsApp');
                            continue;
                        }

                        // Formatar mensagem
                        const economia = lead.targetPrice - currentPrice;
                        const message = 
                            `🎉 Boa notícia! O produto que você está interessado baixou de preço!\n\n` +
                            `*${product.name}*\n` +
                            `Preço anterior: R$ ${lead.targetPrice.toFixed(2)}\n` +
                            `Preço atual: R$ ${currentPrice.toFixed(2)}\n` +
                            `Economia: R$ ${economia.toFixed(2)}\n\n` +
                            `Confira em: https://cupons.altustec.com/comparacao-de-preco/${product.slug}`;

                        // Enviar mensagem
                        console.log('Enviando notificação...');
                        const response = await whatsapp.sendMessage(chatId, message);
                        
                        // Aguardar confirmação
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        const status = await response.getStatus();
                        console.log('Status da mensagem:', status);

                        // Atualizar última notificação
                        await leadsCollection.updateOne(
                            { _id: lead._id },
                            { $set: { lastNotified: new Date() } }
                        );

                    } catch (error) {
                        console.error('Erro ao enviar mensagem:', error);
                    }
                } else {
                    console.log('Preço ainda não baixou o suficiente');
                }
            }

        } catch (error) {
            console.error('Erro:', error);
        } finally {
            console.log('\nFinalizando...');
            await whatsapp.destroy();
            await client.close();
            process.exit();
        }
    });

    // Iniciar WhatsApp
    await whatsapp.initialize();
}

// Executar verificação
checkPrices().catch(console.error);
