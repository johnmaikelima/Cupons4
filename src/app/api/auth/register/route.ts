import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verifica se já existe algum usuário admin
    const adminExists = await User.findOne({ isAdmin: true });

    // Se já existe um admin, não permite criar outro
    if (adminExists) {
      return NextResponse.json(
        { error: 'Já existe um usuário administrador' },
        { status: 400 }
      );
    }

    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário admin
    const user = await User.create({
      email,
      password: hashedPassword,
      isAdmin: true, // Primeiro usuário sempre será admin
    });

    return NextResponse.json({
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
