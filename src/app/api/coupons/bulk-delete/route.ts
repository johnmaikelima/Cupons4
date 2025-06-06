import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Coupon } from '@/models/Coupon';

export async function DELETE(request: Request) {
  try {
    await connectDB();
    
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
        { status: 400 }
      );
    }

    // Exclui os cupons
    const result = await Coupon.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      message: `${result.deletedCount} cupom(ns) excluído(s) com sucesso`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Erro ao excluir cupons:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir cupons' },
      { status: 500 }
    );
  }
}
