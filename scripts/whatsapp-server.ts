import { Client } from 'whatsapp-web.js';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let whatsappClient: Client | null = null;

async function initWhatsApp() {
  if (!whatsappClient) {
    whatsappClient = new Client({
      puppeteer: {
        args: ['--no-sandbox']
      }
    });

    await whatsappClient.initialize();
  }
}

app.post('/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    await initWhatsApp();
    await whatsappClient?.sendMessage(`${phone}@c.us`, message);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;

app.listen(PORT, () => {
  console.log(`WhatsApp server running on port ${PORT}`);
});
