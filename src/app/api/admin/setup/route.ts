import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import mongoose from 'mongoose';

// Função para criar admin via interface web
export async function GET(request: Request) {
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Criar Admin</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px; margin: 2rem auto; padding: 0 1rem; }
          form { display: flex; flex-direction: column; gap: 1rem; }
          input { padding: 0.5rem; font-size: 1rem; }
          button { padding: 0.5rem; font-size: 1rem; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; }
          button:hover { background: #0051cc; }
          .error { color: red; }
          .success { color: green; }
        </style>
      </head>
      <body>
        <h1>Criar Usuário Admin</h1>
        <form id="adminForm">
          <input type="email" name="email" placeholder="Email" required>
          <input type="password" name="password" placeholder="Senha" required>
          <button type="submit">Criar Admin</button>
        </form>
        <p id="message"></p>

        <script>
          document.getElementById('adminForm').onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = {
              email: form.email.value,
              password: form.password.value
            };
            
            try {
              const res = await fetch('/api/admin/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              
              const result = await res.json();
              const msg = document.getElementById('message');
              
              if (res.ok) {
                msg.className = 'success';
                msg.textContent = 'Admin criado com sucesso! Redirecionando...';
                setTimeout(() => window.location.href = '/admin/auth/login', 2000);
              } else {
                msg.className = 'error';
                msg.textContent = result.error || 'Erro ao criar admin';
              }
            } catch (error) {
              document.getElementById('message').className = 'error';
              document.getElementById('message').textContent = 'Erro ao criar admin: ' + error;
              console.error('Erro:', error);
            }
          };
        </script>
      </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

// Função para criar admin via API
export async function POST(request: Request) {
  try {
    // Verificar se já existe algum usuário admin
    await connectDB();
    const UserModel = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      isAdmin: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }));
    
    const existingAdmin = await UserModel.findOne({ isAdmin: true });
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Setup já foi realizado. Um admin já existe.' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário admin
    const newAdmin = await UserModel.create({
      email,
      password: hashedPassword,
      isAdmin: true
    });

    return NextResponse.json(
      { message: 'Admin criado com sucesso', userId: newAdmin._id },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Erro ao criar admin:', error);
    return NextResponse.json(
      { error: `Erro ao criar admin: ${error.message || error}` },
      { status: 500 }
    );
  }
}
