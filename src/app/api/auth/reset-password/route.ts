import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { randomBytes } from 'crypto';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Número do WhatsApp é obrigatório' },
        { status: 400 }
      );
    }

    // Conectar ao MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const leads = db.collection('leads');

    // Verificar se o usuário existe
    const user = await leads.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Gerar token de redefinição
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await leads.updateOne(
      { phone },
      { $set: { resetToken, resetExpires } }
    );

    // Enviar link por WhatsApp
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
    const message = `Olá! Aqui está seu link para redefinir sua senha: ${resetLink}\n\nEste link expira em 1 hora.`;

    // Enviar mensagem via WhatsApp
    if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE !== 'build') {
      await sendWhatsAppMessage(phone, message);
    }

    return NextResponse.json({
      message: 'Link de redefinição enviado para seu WhatsApp'
    });

  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return NextResponse.json(
      { error: 'Erro ao solicitar redefinição de senha' },
      { status: 500 }
    );
  }
}
