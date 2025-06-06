import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import path from 'path';

class WhatsAppService {
  private static instance: WhatsAppService;
  private client: Client;
  private isReady: boolean = false;
  private messageQueue: { to: string; message: string }[] = [];
  private qrCallback?: (qr: string) => void;

  private constructor() {
    // Usar LocalAuth para persistir a sessão
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: path.join(process.cwd(), '.wwebjs_auth')
      }),
      puppeteer: {
        args: ['--no-sandbox']
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on('qr', (qr) => {
      // Gerar QR code no terminal
      qrcode.generate(qr, { small: true });
      
      // Se houver callback registrado, enviar o QR
      if (this.qrCallback) {
        this.qrCallback(qr);
      }
    });

    this.client.on('ready', () => {
      console.log('Cliente WhatsApp está pronto!');
      this.isReady = true;
      this.processQueue();
    });

    this.client.on('disconnected', () => {
      console.log('Cliente WhatsApp desconectado');
      this.isReady = false;
    });

    this.client.on('auth_failure', () => {
      console.error('Falha na autenticação do WhatsApp');
      this.isReady = false;
    });
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  public async initialize() {
    try {
      await this.client.initialize();
    } catch (error) {
      console.error('Erro ao inicializar cliente WhatsApp:', error);
      throw error;
    }
  }

  public onQRCode(callback: (qr: string) => void) {
    this.qrCallback = callback;
  }

  public async sendMessage(to: string, message: string): Promise<void> {
    // Formatar o número para o padrão do WhatsApp
    const formattedNumber = to.replace(/\D/g, '');
    const chatId = `${formattedNumber}@c.us`;

    if (!this.isReady) {
      console.log('Cliente não está pronto, adicionando mensagem à fila...');
      this.messageQueue.push({ to: chatId, message });
      return;
    }

    try {
      await this.client.sendMessage(chatId, message);
      console.log(`Mensagem enviada com sucesso para ${to}`);
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${to}:`, error);
      throw error;
    }
  }

  private async processQueue() {
    if (!this.isReady || this.messageQueue.length === 0) return;

    console.log(`Processando fila de mensagens (${this.messageQueue.length} mensagens)`);

    for (const { to, message } of this.messageQueue) {
      try {
        await this.client.sendMessage(to, message);
        console.log(`Mensagem da fila enviada com sucesso para ${to}`);
      } catch (error) {
        console.error(`Erro ao enviar mensagem da fila para ${to}:`, error);
      }
    }

    this.messageQueue = [];
  }

  public isClientReady(): boolean {
    return this.isReady;
  }
}

export default WhatsAppService;
