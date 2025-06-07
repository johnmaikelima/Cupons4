const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

async function testWhatsApp() {
    console.log('Iniciando teste do WhatsApp...');

    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['--no-sandbox'],
            headless: false
        }
    });

    client.on('qr', (qr) => {
        console.log('QR Code recebido:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
        console.log('WhatsApp Web está pronto!');

        try {
            // Primeiro número
            const number1 = '5511987756034';
            const chatId1 = number1 + '@c.us';
            console.log('\nTestando primeiro número:', chatId1);
            
            const isRegistered1 = await client.isRegisteredUser(chatId1);
            console.log('Número registrado?', isRegistered1);

            if (isRegistered1) {
                console.log('Enviando mensagem de teste...');
                const msg1 = '🤖 Teste 1 do sistema de alertas de preço - ' + new Date().toLocaleString();
                const response1 = await client.sendMessage(chatId1, msg1);
                console.log('Mensagem enviada, aguardando status...');
                
                // Aguardar e verificar status
                await new Promise(resolve => setTimeout(resolve, 5000));
                const status1 = await response1.getStatus();
                console.log('Status da mensagem:', status1);
            }

            // Segundo número (para teste)
            const number2 = '5511992177044';
            const chatId2 = number2 + '@c.us';
            console.log('\nTestando segundo número:', chatId2);
            
            const isRegistered2 = await client.isRegisteredUser(chatId2);
            console.log('Número registrado?', isRegistered2);

            if (isRegistered2) {
                console.log('Enviando mensagem de teste...');
                const msg2 = '🤖 Teste 2 do sistema de alertas de preço - ' + new Date().toLocaleString();
                const response2 = await client.sendMessage(chatId2, msg2);
                console.log('Mensagem enviada, aguardando status...');
                
                // Aguardar e verificar status
                await new Promise(resolve => setTimeout(resolve, 5000));
                const status2 = await response2.getStatus();
                console.log('Status da mensagem:', status2);
            }

            // Manter o script rodando por 30 segundos
            console.log('\nAguardando 30 segundos para verificar as mensagens...');
            await new Promise(resolve => setTimeout(resolve, 30000));

        } catch (error) {
            console.error('Erro:', error);
        } finally {
            console.log('\nEncerrando...');
            await client.destroy();
            process.exit();
        }
    });

    client.on('message', (msg) => {
        console.log('\nMensagem recebida:', msg.body);
    });

    client.on('message_ack', (msg, ack) => {
        // 0: Enviando, 1: Enviado, 2: Recebido, 3: Lido
        console.log('\nStatus atualizado para mensagem:', msg.body);
        console.log('Novo status:', ['Enviando', 'Enviado', 'Recebido', 'Lido'][ack]);
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
