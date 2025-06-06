import { NextResponse } from 'next/server';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import { connectDB } from '@/lib/mongodb';

// DELETE /api/cleanup
export async function DELETE() {
  try {
    await connectDB();
    
    // Exclui todos os cupons
    await Coupon.deleteMany({});
    
    // Exclui todas as lojas
    await Store.deleteMany({});
    
    return NextResponse.json({
      message: 'Todos os cupons e lojas foram excluídos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    return NextResponse.json(
      { message: 'Erro ao limpar dados' },
      { status: 500 }
    );
  }
}
