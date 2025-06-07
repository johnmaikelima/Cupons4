const { Client, LocalAuth } = require('whatsapp-web.js');

(async () => {
    console.log('Iniciando...');

    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['--no-sandbox'],
            headless: false
        }
    });

    // Evento quando o cliente está pronto
    client.on('ready', async () => {
        console.log('WhatsApp Web conectado!');
        
        try {
            // Número de telefone (com código do país)
            const number = '5511987756034'; // Seu número
            const chatId = number + '@c.us';
            
            console.log(`\nVerificando número ${chatId}...`);
            const isRegistered = await client.isRegisteredUser(chatId);
            
            if (!isRegistered) {
                console.log('Número não está registrado no WhatsApp');
                await client.destroy();
                process.exit(1);
            }

            console.log('Número verificado, enviando mensagem...');
            
            // Enviar mensagem
            const message = `🤖 Teste do sistema de alertas\nHora: ${new Date().toLocaleString()}`;
            const msg = await client.sendMessage(chatId, message);
            
            console.log('Mensagem enviada, aguardando confirmação...');

            // Aguardar 30 segundos para ter certeza que a mensagem foi enviada
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            const status = await msg.getStatus();
            console.log(`Status final: ${status}`);
            
            // Fechar cliente
            await client.destroy();
            console.log('Cliente fechado');
            process.exit(0);
            
        } catch (err) {
            console.error('Erro:', err);
            await client.destroy();
            process.exit(1);
        }
    });

    // Evento quando recebe mensagem
    client.on('message', msg => {
        console.log('Mensagem recebida:', msg.body);
    });

    // Evento quando o status da mensagem muda
    client.on('message_ack', (msg, ack) => {
        // 0: Enviando, 1: Enviado ao servidor, 2: Recebido pelo destinatário, 3: Lido pelo destinatário
        const status = ['Enviando', 'Enviado', 'Recebido', 'Lido'][ack];
        console.log(`Status da mensagem "${msg.body}": ${status}`);
    });

    // Evento em caso de falha na autenticação
    client.on('auth_failure', err => {
        console.error('Falha na autenticação:', err);
        process.exit(1);
    });

    // Evento quando desconecta
    client.on('disconnected', reason => {
        console.log('Desconectado:', reason);
        process.exit(1);
    });

    console.log('Inicializando cliente...');
    await client.initialize();
})();
