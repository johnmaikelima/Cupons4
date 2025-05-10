import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { Coupon } from '@/models/Coupon';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    await connectDB();
    
    const query = storeId ? { store: storeId } : {};
    const coupons = await Coupon.find(query)
      .populate('store')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(coupons);
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
