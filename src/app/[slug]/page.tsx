import './styles.css';
import { notFound } from 'next/navigation';
import { Page } from '@/models/Page';
import { connectDB } from '@/lib/mongodb';
import { OffersClient } from '@/components/OffersClient';
import { CategoryDisplay } from '@/components/CategoryDisplay';
import { MobileFiltersToggle } from '@/components/MobileFiltersToggle';


// Isso garante que a página será renderizada estaticamente
export const revalidate = 3600; // revalidar a cada 1 hora

async function getPage(slug: string) {
  await connectDB();
  
  const page = await Page.findOne({ 
    slug,
    active: true 
  });

  if (!page) {
    notFound();
  }

  return page;
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Garantir que slug está disponível
  if (!slug) {
    notFound();
  }

  const page = await getPage(slug);

  return (
    
    <div>
      <article className="page-content">
        {/* Nome da categoria da URL */}
        <CategoryDisplay />

        <div className="content-with-sidebar">
          {/* Botão mobile para mostrar/esconder filtros */}
          <MobileFiltersToggle />

          {/* Sidebar com filtros */}
          <aside className="filters-sidebar">
            <div id="filtro-lojas" />
          </aside>

          {/* Conteúdo principal */}
          <div className="main-content">
            <div dangerouslySetInnerHTML={{ __html: page.content }} />

            {/* Div dos produtos e paginação */}
            <div className="offers-section">
              <OffersClient />
            </div>
          </div>
        </div>

        {/* Texto sobre a categoria */}
        {page.categoryText && (
          <section className="category-text">
            <div dangerouslySetInnerHTML={{ __html: page.categoryText }} />
          </section>
        )}


      </article>
    </div>
  );
}
