import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import { ComparisonProduct } from "@/models/ComparisonProduct";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { phone, password, productId, currentPrice } = await request.json();

    // Validar telefone
    const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { message: "Formato de telefone inválido. Use (99) 99999-9999" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar se o preço foi enviado e é válido
    if (!currentPrice || currentPrice <= 0) {
      return NextResponse.json(
        { message: "Preço inválido" },
        { status: 400 }
      );
    }

    const product = await ComparisonProduct.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe um lead para este produto e telefone
    const existingLead = await Lead.findOne({ phone, productId });
    if (existingLead) {
      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, existingLead.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { message: "Senha incorreta" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        message: "Você já tem um alerta para este produto",
      });
    }

    // Criar novo lead
    const hashedPassword = await bcrypt.hash(password, 10);
    await Lead.create({
      phone,
      password: hashedPassword,
      productId,
      targetPrice: currentPrice, // Salvar o preço atual como preço alvo
      createdAt: new Date()
    });

    return NextResponse.json({
      message: "Alerta de preço criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar alerta de preço:", error);
    return NextResponse.json(
      { message: "Erro ao criar alerta de preço" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: "Token não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { phone: string };
    } catch (error) {
      return NextResponse.json(
        { message: "Token inválido" },
        { status: 401 }
      );
    }

    const { phone } = decoded;

    await connectDB();

    // Buscar todos os leads do telefone e popular os produtos com seus preços
    const leads = await Lead.find({ phone })
      .populate({
        path: 'productId',
        model: ComparisonProduct,
        select: 'name slug images prices' // Incluir todos os preços
      })
      .lean(); // Usar lean() para melhor performance
    
    if (leads.length === 0) {
      return NextResponse.json(
        { alerts: [] }
      );
    }

    // Log para debug
    console.log('Leads encontrados:', JSON.stringify(leads, null, 2));

    return NextResponse.json({
      alerts: leads.map(lead => ({
        productId: lead.productId,
        targetPrice: lead.targetPrice,
        createdAt: lead.createdAt,
        lastNotified: lead.lastNotified
      }))
    });
  } catch (error) {
    console.error("Erro ao buscar alertas:", error);
    return NextResponse.json(
      { message: "Erro ao buscar alertas" },
      { status: 500 }
    );
  }
}
