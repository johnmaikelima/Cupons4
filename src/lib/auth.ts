import { NextAuthOptions, DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      isAdmin: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    isAdmin: boolean;
  }
}
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Iniciando autenticação...');
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Credenciais faltando:', { email: !!credentials?.email, password: !!credentials?.password });
            throw new Error('Credenciais inválidas');
          }

          console.log('Conectando ao MongoDB...');
          await connectDB();
          console.log('Conectado ao MongoDB');

          const UserModel = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            isAdmin: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
          }));

          console.log('Buscando usuário...');
          const user = await UserModel.findOne({ email: credentials.email });
          console.log('Usuário encontrado:', !!user);
          
          if (!user || !user.password) {
            console.log('Usuário não encontrado ou sem senha');
            throw new Error('Usuário não encontrado');
          }

          console.log('Verificando senha...');
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('Senha válida:', isValid);

          if (!isValid) {
            throw new Error('Senha incorreta');
          }

          console.log('Autenticação bem sucedida');
          return {
            id: user._id.toString(),
            email: user.email,
            isAdmin: user.isAdmin
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return baseUrl + url;
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
};
