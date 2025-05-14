'use client';

import { useState, useEffect } from 'react';
import './AIArticle.css';

interface AIArticleProps {
  searchTerm: string;
}

function getSearchParams() {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('categoria') || '';
  }
  return '';
}

export function AIArticle({ searchTerm }: AIArticleProps) {
  const [article, setArticle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const categoria = getSearchParams();

  useEffect(() => {
    const generateArticle = async () => {
      try {
        // Usar categoria da URL ou fallback para o slug
        const searchTermToUse = categoria || searchTerm;
        const cleanTerm = searchTermToUse.replace(/-/g, ' ');

        const prompt = `Crie um artigo curto e objetivo sobre:

# Qual ${cleanTerm} comprar?

## O que observar na hora da compra

Use linguagem simples e direta em português do Brasil. Foque apenas nos pontos mais importantes para a decisão de compra. Máximo de 300 palavras.`;

        console.log('Gerando artigo para:', cleanTerm);

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('Erro na API:', error);
          throw new Error('Falha ao gerar artigo');
        }

        const data = await response.json();
        
        if (data.error) {
          console.error('Erro nos dados:', data.error);
          throw new Error(typeof data.error === 'string' ? data.error : 'Erro na API');
        }

        if (!data.choices?.[0]?.message?.content) {
          console.error('Resposta inválida:', data);
          throw new Error('Resposta inválida da API');
        }
        
        const generatedText = data.choices[0].message.content;
        // Converter markdown para HTML
        // Remover os colchetes do texto gerado
        const cleanText = generatedText.replace(/\[.*?\]/g, '');

        // Converter markdown para HTML
        const htmlContent = cleanText
          .replace(/# (.*?)\n/g, '<h2>$1</h2>\n')
          .replace(/## (.*?)\n/g, '<h3>$1</h3>\n')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .split('\n\n')
          .map(paragraph => paragraph.trim())
          .filter(paragraph => paragraph)
          .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
          .join('\n');

        setArticle(htmlContent);
      } catch (error) {
        console.error('Erro ao gerar artigo:', error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          setArticle('Erro de conexão com a API. Por favor, verifique sua conexão com a internet.');
        } else {
          setArticle('Não foi possível gerar o artigo no momento. Por favor, tente novamente mais tarde.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (searchTerm) {
      generateArticle();
    }
  }, [searchTerm]);

  if (!searchTerm) return null;

  return (
    <section className="ai-article">
      {isLoading ? (
        <div className="article-loading">
          <div className="loading-spinner" />
          <p>Gerando artigo personalizado...</p>
        </div>
      ) : (
        <div className="article-content" dangerouslySetInnerHTML={{ __html: article }} />
      )}
    </section>
  );
}
