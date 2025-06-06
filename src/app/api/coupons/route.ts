import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Definindo o modelo Store
const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  url: { type: String },
  description: { type: String },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  provider: { type: String },
  hasOffers: { type: Boolean, default: false },
  externalId: { type: String },
  affiliateLink: { type: String }
}, {
  timestamps: true
});

// Deleta o modelo existente se ele existir
if (mongoose.models.Store) {
  delete mongoose.models.Store;
}

// Registra o modelo Store
const Store = mongoose.model('Store', StoreSchema);

// Importa o modelo Coupon
import { Coupon } from '@/models/Coupon';

export async function GET(request: Request) {
  try {
    console.log('Iniciando busca de cupons...');
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    console.log('Conectando ao MongoDB...');
    await connectDB();
    console.log('Conectado ao MongoDB');
    
    const query = storeId ? { store: storeId } : {};
    console.log('Query:', query);
    
    console.log('Buscando cupons...');
    const coupons = await Coupon.find(query)
      .populate('store')
      .sort({ createdAt: -1 });
    console.log('Cupons encontrados:', coupons.length);
      
    const response = NextResponse.json(coupons);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    return NextResponse.json({ error: 'Erro ao buscar cupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();
    
    // Adiciona campos padrão
    const couponData = {
      ...body,
      provider: 'manual',
      expiresAt: body.expiryDate, // Corrigido para expiresAt
      url: body.affiliateLink, // URL é o link de afiliado
      affiliateLink: body.affiliateLink // Mantemos em ambos os campos por compatibilidade
    };
    
    const coupon = await Coupon.create(couponData);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cupom:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro ao criar cupom'
    }, { status: 500 });
  }
}
