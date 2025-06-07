const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

async function testWhatsApp() {
    console.log('Iniciando teste do WhatsApp...');

    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['--no-sandbox'],
            headless: false // Mostrar navegador para debug
        }
    });

    client.on('qr', (qr) => {
        console.log('QR Code recebido:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
        console.log('WhatsApp Web está pronto!');

        try {
            const number = '5511987756034'; // Seu número com código do país
            const chatId = number + '@c.us';

            console.log('Verificando número:', chatId);
            const isRegistered = await client.isRegisteredUser(chatId);
            console.log('Número registrado?', isRegistered);

            if (isRegistered) {
                console.log('Enviando mensagem de teste...');
                const response = await client.sendMessage(chatId, '🤖 Teste do sistema de alertas de preço');
                
                console.log('Aguardando confirmação...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                const status = await response.getStatus();
                console.log('Status da mensagem:', status);
            }

        } catch (error) {
            console.error('Erro:', error);
        } finally {
            console.log('Encerrando...');
            await client.destroy();
            process.exit();
        }
    });

    client.on('auth_failure', (msg) => {
        console.error('Falha na autenticação:', msg);
    });

    client.on('disconnected', (reason) => {
        console.log('Cliente desconectado:', reason);
    });

    console.log('Inicializando cliente...');
    await client.initialize();
}

testWhatsApp().catch(console.error);
