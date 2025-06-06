import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Conectar ao MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const leads = db.collection('leads');

    // Buscar usuário com token válido
    const user = await leads.findOne({
      resetToken: token,
      resetExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e remover token
    await leads.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetExpires: "" }
      }
    );

    return NextResponse.json({
      message: 'Senha atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao confirmar redefinição de senha:', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar redefinição de senha' },
      { status: 500 }
    );
  }
}
