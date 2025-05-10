import { NextResponse } from 'next/server';
import { Store } from '@/models/Store';
import { connectDB } from '@/lib/mongoose';

async function checkImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    await connectDB();
    const stores = await Store.find({});
    const results = [];

    for (const store of stores) {
      const isLogoValid = store.logo ? await checkImageUrl(store.logo) : false;
      
      results.push({
        name: store.name,
        logo: store.logo,
        isValid: isLogoValid,
        needsAttention: !isLogoValid
      });
    }

    // Ordenar por lojas que precisam de atenção primeiro
    results.sort((a, b) => {
      if (a.needsAttention === b.needsAttention) {
        return a.name.localeCompare(b.name);
      }
      return a.needsAttention ? -1 : 1;
    });

    return NextResponse.json({
      success: true,
      total: stores.length,
      needingAttention: results.filter(r => r.needsAttention).length,
      results
    });

  } catch (error) {
    console.error('Erro ao verificar logos:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar logos das lojas' },
      { status: 500 }
    );
  }
}
