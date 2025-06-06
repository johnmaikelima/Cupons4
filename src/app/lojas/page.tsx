import { Store } from '@/models/Store';
import { connectDB } from '@/lib/mongodb';
import StoreCard from '@/components/StoreCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Todas as Lojas com Cupons de Desconto',
  description: 'Encontre cupons de desconto e ofertas das melhores lojas online. Economize em suas compras com códigos promocionais exclusivos.'
};

async function getStores(retryCount = 0): Promise<any[]> {
  try {
    await connectDB();
    const stores = await Store.find()
      .select('name logo slug description')
      .sort({ name: 1 })
      .lean();

    return stores.map(store => ({
      ...store,
      _id: store._id.toString()
    }));
  } catch (error) {
    console.error(`Tentativa ${retryCount + 1} falhou:`, error);
    if (retryCount < 2) { // Tenta no máximo 3 vezes
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return getStores(retryCount + 1);
    }
    throw error;
  }
}

export default async function StoresPage() {
  const storesData = await getStores();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Todas as Lojas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storesData.map((store) => (
          <StoreCard key={store._id} store={store} />
        ))}
      </div>
    </div>
  );
}
