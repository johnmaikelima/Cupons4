import { NextResponse } from 'next/server';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import { connectDB } from '@/lib/mongodb';

// DELETE /api/reset
export async function DELETE() {
  try {
    await connectDB();
    
    // Exclui todos os cupons
    await Coupon.deleteMany({});
    
    // Exclui todas as lojas
    await Store.deleteMany({});

    return NextResponse.json({
      message: 'Banco de dados limpo com sucesso',
      stats: {
        stores: 0,
        coupons: 0
      }
    });
  } catch (error) {
    console.error('Erro ao limpar banco de dados:', error);
    return NextResponse.json(
      { message: 'Erro ao limpar banco de dados' },
      { status: 500 }
    );
  }
}
