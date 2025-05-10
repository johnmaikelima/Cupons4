import { Store } from '@/models/Store';
import connectDB from '@/lib/mongodb';
import StoreCard from '@/components/StoreCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Todas as Lojas com Cupons de Desconto',
  description: 'Encontre cupons de desconto e ofertas das melhores lojas online. Economize em suas compras com códigos promocionais exclusivos.'
};

export default async function StoresPage() {
  await connectDB();
  const stores = await Store.find()
    .select('name logo slug description')
    .sort({ name: 1 })
    .lean();

  const storesData = stores.map(store => ({
    ...store,
    _id: store._id.toString()
  }));

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
