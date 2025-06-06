export async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    const response = await fetch(`http://localhost:${process.env.WHATSAPP_SERVER_PORT || 3001}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}
