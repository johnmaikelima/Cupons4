import Image from 'next/image';
import CouponModal from '@/components/CouponModal';
import CouponCard from '@/components/CouponCard';
import StoreHeader from '@/components/StoreHeader';
import StoreSidebar from '@/components/StoreSidebar';
import RelatedStores from '@/components/RelatedStores';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';
import { connectDB } from '@/lib/mongoose';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    slug: string;
  };
}

// Função para formatar o mês em português
function getMonthName(month: number): string {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 
    'maio', 'junho', 'julho', 'agosto',
    'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return months[month];
}

// Função para encontrar o maior desconto entre os cupons ativos
function getMaxDiscount(coupons: any[]): number {
  if (!coupons || !Array.isArray(coupons)) return 0;
  
  const now = new Date();
  const activeCoupons = coupons.filter(coupon => 
    coupon.active && new Date(coupon.expiresAt) > now
  );

  let maxDiscount = 0;
  for (const coupon of activeCoupons) {
    if (coupon.type === 'percentage') {
      maxDiscount = Math.max(maxDiscount, 50); // Valor padrão de 50% para cupons de porcentagem
    } else if (coupon.type === 'fixed') {
      maxDiscount = Math.max(maxDiscount, 30); // Valor padrão de 30% para cupons de valor fixo
    } else if (coupon.type === 'freeShipping') {
      maxDiscount = Math.max(maxDiscount, 20); // Valor padrão de 20% para cupons de frete grátis
    }
  }
  return maxDiscount;
}

// Função para formatar a data
const formatExpiryDate = (date: string) => {
  if (!date) return "Mai/2025";
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const d = new Date(date);
  return `${months[d.getMonth()]}/${d.getFullYear()}`;
};

// Função para gerar os metadados da página
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  
  const store = await Store.findOne({ slug: params.slug });
  if (!store) {
    return {
      title: 'Loja não encontrada'
    };
  }

  // Busca os cupons ativos da loja
  const now = new Date();
  const coupons = await Coupon.find({
    store: store._id,
    active: true,
    expiresAt: { $gt: now }
  });

  const maxDiscount = getMaxDiscount(coupons);
  const month = getMonthName(now.getMonth());
  const year = now.getFullYear();

  const title = maxDiscount > 0
    ? `Cupons ${store.name} 💰Até ${maxDiscount}% OFF em ${month} de ${year}`
    : `Cupons ${store.name} - Ofertas de ${month} de ${year}`;

  return {
    title,
    description: `Cupons de desconto ${store.name} válidos para ${month} de ${year}. Economize até ${maxDiscount}% em suas compras.`
  };
}

export default async function StorePage({ params }: Props) {
  if (!params?.slug) {
    return notFound();
  }

  await connectDB();
  
  // Busca os dados da loja atual
  const store = await Store.findOne({ slug: params.slug });
  if (!store) {
    return notFound();
  }

  // Busca os cupons ativos da loja
  const now = new Date();
  const coupons = await Coupon.find({
    store: store._id,
    active: true,
    expiresAt: { $gt: now }
  }).sort({ createdAt: -1 });

  // Converte os dados do MongoDB para objetos simples
  const storeData = {
    ...store.toObject(),
    _id: store._id.toString(),
    coupons: coupons.map(coupon => ({
      ...coupon.toObject(),
      _id: coupon._id.toString(),
      affiliateLink: coupon.affiliateLink || store.affiliateLink || '#', // Usa o link da loja se não tiver link específico do cupom
      store: {
        _id: store._id.toString(),
        name: store.name,
        logo: store.logo
      }
    }))
  };

  // Busca lojas relacionadas
  const relatedStores = await Store.find({
    _id: { $ne: store._id },
    active: true,
    $or: [
      { category: store.category }
    ]
  })
  .limit(12)
  .select('name logo slug')
  .lean();

  // Converte as lojas relacionadas para objetos simples
  const relatedStoresData = relatedStores.map(store => ({
    ...store,
    _id: store._id.toString()
  }));

  const maxDiscount = getMaxDiscount(storeData.coupons);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Store Header with Stats */}
      <StoreHeader
        logo={storeData.logo}
        name={storeData.name}
        maxDiscount={maxDiscount}
        affiliateLink={store.affiliateLink || '#'}
        activeCoupons={storeData.coupons?.length || 0}
        expirationDate={formatExpiryDate(storeData.coupons?.[0]?.expiresAt)}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Cupons Ativos */}
          {storeData.coupons && storeData.coupons.length > 0 ? (
            <div className="flex flex-col gap-4 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                Cupons Ativos ({storeData.coupons.length})
              </h2>
              <div className="grid gap-4">
                {storeData.coupons.map((coupon: any) => (
                  <CouponCard
                    key={coupon._id}
                    coupon={coupon}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 mb-8">
              <p className="text-yellow-800">
                No momento não há cupons ativos para esta loja. 
                Por favor, volte mais tarde ou confira outras lojas.
              </p>
            </div>
          )}

          {/* Store Description */}
          <article className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Sobre a {storeData.name}</h2>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: storeData.description || '' }}
            />
          </article>

          {/* Lojas Relacionadas */}
          {relatedStoresData.length > 0 && (
            <RelatedStores
              stores={relatedStoresData}
              currentStoreId={storeData._id}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          <div className="lg:sticky lg:top-4 space-y-6">
            <StoreSidebar
              storeName={storeData.name}
              affiliateLink={store.affiliateLink || '#'}
            />

            {/* Stats Cards */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Informações da Loja</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cupons Ativos</span>
                  <span className="font-semibold">{storeData.coupons?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Maior Desconto</span>
                  <span className="font-semibold">{maxDiscount}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Última Atualização</span>
                  <span className="font-semibold">
                    {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {storeData.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Categoria</span>
                    <span className="font-semibold">{storeData.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
