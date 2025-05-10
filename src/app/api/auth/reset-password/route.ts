import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verifica se o usuário existe e é admin
    const user = await User.findOne({ email, isAdmin: true });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário administrador não encontrado' },
        { status: 404 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      message: 'Senha atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    );
  }
}
