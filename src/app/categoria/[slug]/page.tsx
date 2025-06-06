import { connectDB } from '@/lib/mongodb';
import { ComparisonProduct, IComparisonProduct } from '@/models/ComparisonProduct';
import ProductCard from '@/components/ProductCard';
import { IoGrid } from 'react-icons/io5';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

type Props = {
  params: {
    slug: string;
  };
  searchParams?: {
    page?: string;
  };
};

const ITEMS_PER_PAGE = 30;

async function getCategoryProducts(slug: string, page: number = 1) {
  try {
    await connectDB();

    // Já temos o modelo importado

    // Converte o slug para o nome da categoria
    const categoryName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Cria variações do nome da categoria para melhorar a busca
    const singularName = categoryName.replace(/s$/, '');
    const pluralName = categoryName.endsWith('s') ? categoryName : `${categoryName}s`;
    
    // Busca por correspondência exata primeiro
    const exactQuery = {
      $or: [
        { category: categoryName },
        { category: singularName },
        { category: pluralName }
      ]
    };

    // Verifica se existem resultados com correspondência exata
    const exactCount = await ComparisonProduct.countDocuments(exactQuery);

    // Se não houver resultados exatos, tenta busca mais flexível
    const query = exactCount > 0 ? exactQuery : {
      $or: [
        { category: { $regex: new RegExp(categoryName, 'i') } },
        { category: { $regex: new RegExp(singularName, 'i') } },
        { category: { $regex: new RegExp(pluralName, 'i') } },
        { category: { $regex: new RegExp(categoryName.split(' ')[0], 'i') } }
      ]
    };

    const skip = (page - 1) * ITEMS_PER_PAGE;

    const [products, totalProducts] = await Promise.all([
      ComparisonProduct
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(ITEMS_PER_PAGE)
        .lean(),
      ComparisonProduct.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    return {
      products: JSON.parse(JSON.stringify(products)),
      totalProducts,
      totalPages,
    };
  } catch (error) {
    console.error('Erro ao buscar produtos da categoria:', error);
    return { products: [], totalProducts: 0, totalPages: 0 };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  // Aguarda os parâmetros
  const { slug } = await Promise.resolve(params);
  const { page } = await Promise.resolve(searchParams || {});
  
  const currentPage = Number(page) || 1;
  const { products, totalProducts, totalPages } = await getCategoryProducts(slug, currentPage);
  
  const categoryName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Cabeçalho da categoria */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <IoGrid className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              {categoryName}
            </h1>
          </div>
          <p className="text-gray-600">
            {totalProducts} {totalProducts === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>

        {/* Grid de produtos */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product: IComparisonProduct) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <a href={`/produtos/${product.slug}`} className="block">
                    <div className="aspect-square relative">
                      <img
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                      
                      {/* Preços das lojas */}
                      <div className="space-y-2 mb-3">
                        {Array.isArray(product.prices) && product.prices
                          .filter((price: any) => price && price.price > 0)
                          .sort((a: any, b: any) => a.price - b.price)
                          .slice(0, 2)
                          .map((price: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 truncate flex-1 mr-2">{price.storeName}</span>
                              <span className="font-semibold text-gray-900 whitespace-nowrap">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(price.price)}
                              </span>
                            </div>
                          ))}
                      </div>
                      
                      <button className="mt-3 w-full bg-blue-600 text-white text-sm py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                        Ver Ofertas
                      </button>
                    </div>
                  </a>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {currentPage > 1 && (
                  <a
                    href={`/categoria/${params.slug}?page=${currentPage - 1}`}
                    className="inline-flex items-center justify-center w-10 h-10 text-gray-600 bg-white rounded-lg hover:bg-gray-100"
                  >
                    <FaChevronLeft className="w-4 h-4" />
                  </a>
                )}
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <a
                    key={page}
                    href={`/categoria/${params.slug}?page=${page}`}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 bg-white hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </a>
                ))}

                {currentPage < totalPages && (
                  <a
                    href={`/categoria/${params.slug}?page=${currentPage + 1}`}
                    className="inline-flex items-center justify-center w-10 h-10 text-gray-600 bg-white rounded-lg hover:bg-gray-100"
                  >
                    <FaChevronRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Nenhum produto encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
