import { NextResponse } from 'next/server';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import { connectDB } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const SOURCE_ID = '38359488';

// Função para atualizar o sourceId nos links
function updateSourceId(url: string): string {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('sourceId', SOURCE_ID);
    return urlObj.toString();
  } catch (error) {
    console.error('Erro ao atualizar sourceId no link:', error);
    return url;
  }
}

export async function GET() {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Atualiza links das lojas
    const stores = await Store.find({ provider: 'lomadee' });
    console.log(`Encontradas ${stores.length} lojas para atualizar`);
    
    let storesUpdated = 0;
    for (const store of stores) {
      if (store.url || store.affiliateLink) {
        const updates: any = {};
        
        if (store.url) {
          updates.url = updateSourceId(store.url);
        }
        if (store.affiliateLink) {
          updates.affiliateLink = updateSourceId(store.affiliateLink);
        }
        
        if (Object.keys(updates).length > 0) {
          await Store.updateOne(
            { _id: store._id },
            { $set: updates }
          );
          storesUpdated++;
        }
      }
    }
    
    // Atualiza links dos cupons
    const coupons = await Coupon.find({ provider: 'lomadee' });
    console.log(`Encontrados ${coupons.length} cupons para atualizar`);
    
    let couponsUpdated = 0;
    for (const coupon of coupons) {
      if (coupon.url || coupon.affiliateLink) {
        const updates: any = {};
        
        if (coupon.url) {
          updates.url = updateSourceId(coupon.url);
        }
        if (coupon.affiliateLink) {
          updates.affiliateLink = updateSourceId(coupon.affiliateLink);
        }
        
        if (Object.keys(updates).length > 0) {
          await Coupon.updateOne(
            { _id: coupon._id },
            { $set: updates }
          );
          couponsUpdated++;
        }
      }
    }

    return NextResponse.json({
      message: 'Links atualizados com sucesso',
      stats: {
        storesUpdated,
        couponsUpdated
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar links:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao atualizar links' },
      { status: 500 }
    );
  }
}
