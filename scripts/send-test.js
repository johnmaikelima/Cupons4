const { Client, LocalAuth } = require('whatsapp-web.js');

(async () => {
    process.stdout.write('Iniciando...\n');

    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['--no-sandbox'],
            headless: false
        }
    });

    client.on('ready', async () => {
        process.stdout.write('Cliente pronto!\n');
        
        const number = '5511987756034';
        const chatId = number + '@c.us';
        
        process.stdout.write(`Enviando mensagem para ${chatId}...\n`);
        
        try {
            const msg = await client.sendMessage(chatId, '🤖 Teste do sistema');
            process.stdout.write('Mensagem enviada!\n');
            
            setTimeout(async () => {
                const status = await msg.getStatus();
                process.stdout.write(`Status: ${status}\n`);
                process.exit(0);
            }, 5000);
            
        } catch (err) {
            process.stderr.write(`Erro: ${err}\n`);
            process.exit(1);
        }
    });

    client.on('auth_failure', () => {
        process.stderr.write('Falha na autenticação\n');
        process.exit(1);
    });

    process.stdout.write('Inicializando cliente...\n');
    await client.initialize();
})();
