import { NextResponse } from 'next/server';
import { Coupon } from '@/models/Coupon';
import { connectDB } from '@/lib/mongodb';

// GET /api/coupons/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const coupon = await Coupon.findById(params.id).populate('store');
    
    if (!coupon) {
      return NextResponse.json(
        { message: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Erro ao buscar cupom:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar cupom' },
      { status: 500 }
    );
  }
}

// PUT /api/coupons/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    await connectDB();

    const coupon = await Coupon.findById(params.id);
    if (!coupon) {
      return NextResponse.json(
        { message: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    // Atualiza os campos do cupom
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      params.id,
      {
        title: data.title,
        description: data.description,
        store: data.store,
        type: data.type,
        expiresAt: data.expiryDate, // Corrigido para expiresAt
        image: data.image,
        code: data.code, // Adicionado campo code
        url: data.affiliateLink, // URL é o link de afiliado
        affiliateLink: data.affiliateLink, // Mantemos em ambos os campos por compatibilidade
        active: data.active
      },
      { new: true }
    ).populate('store');

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar cupom' },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const coupon = await Coupon.findById(params.id);
    if (!coupon) {
      return NextResponse.json(
        { message: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    await Coupon.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Cupom excluído com sucesso' }
    );
  } catch (error) {
    console.error('Erro ao excluir cupom:', error);
    return NextResponse.json(
      { message: 'Erro ao excluir cupom' },
      { status: 500 }
    );
  }
}
