import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export async function GET() {
  try {
    await connectDB();

    // Busca produtos com rating maior que 0
    const produtosComRating = await Product.find({ rating: { $gt: 0 } })
      .sort({ rating: -1 }) // Ordena por rating decrescente
      .limit(10); // Limita a 10 produtos para não sobrecarregar

    // Conta total de produtos com rating > 0
    const totalComRating = await Product.countDocuments({ rating: { $gt: 0 } });

    // Conta total de produtos
    const totalProdutos = await Product.countDocuments();

    // Calcula estatísticas
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          mediaRating: { $avg: "$rating" },
          maxRating: { $max: "$rating" },
          minRating: { $min: "$rating" }
        }
      }
    ]);

    return NextResponse.json({
      totalProdutos,
      totalComRating,
      porcentagemComRating: ((totalComRating / totalProdutos) * 100).toFixed(2) + '%',
      estatisticas: stats[0],
      exemplos: produtosComRating.map(p => ({
        nome: p.product_name,
        rating: p.rating,
        merchant: p.merchant_name
      }))
    });

  } catch (error) {
    console.error('Erro ao verificar ratings:', error);
    return NextResponse.json(
      { error: 'Falha ao verificar ratings' },
      { status: 500 }
    );
  }
}
