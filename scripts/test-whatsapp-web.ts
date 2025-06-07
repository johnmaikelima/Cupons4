import WhatsAppService from '../src/services/whatsapp';

async function testWhatsApp() {
  try {
    const whatsapp = WhatsAppService.getInstance();
    
    // Registrar callback para o QR code
    whatsapp.onQRCode((qr) => {
      console.log('\nPor favor, escaneie o QR code acima com seu WhatsApp para conectar.\n');
    });

    // Inicializar o cliente
    console.log('Iniciando cliente WhatsApp...');
    await whatsapp.initialize();

    // Aguardar até que o cliente esteja pronto
    while (!whatsapp.isClientReady()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Enviar mensagem de teste
    const testNumber = '5511987756034';
    const message = '🔔 Teste do Sistema de Alertas\n\nEsta é uma mensagem de teste do sistema de alertas de preço do LinkCompra.\n\nSe você recebeu esta mensagem, o sistema está funcionando corretamente!';

    console.log(`\nEnviando mensagem de teste para ${testNumber}...`);
    await whatsapp.sendMessage(testNumber, message);
    
    console.log('Teste concluído! Você pode fechar este script.');

  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

testWhatsApp();
