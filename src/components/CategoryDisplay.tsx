'use client';

import { useSearchParams } from 'next/navigation';

export function CategoryDisplay() {
  const searchParams = useSearchParams();
  const categoria = searchParams.get('categoria');

  if (!categoria) return null;

  // Formata o texto da categoria (remove hífens e capitaliza)
  const formatText = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="category-highlight">
      <p className="highlight-text">
        Encontramos o melhor preço de <span className="category-name">{formatText(categoria)}</span>.
        Veja o resultado abaixo e economize agora mesmo.
      </p>
    </div>
  );
}
