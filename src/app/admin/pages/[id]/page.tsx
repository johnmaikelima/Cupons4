'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageForm from '@/components/admin/PageForm';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useParams } from 'next/navigation';

interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
}

export default function EditPagePage() {
  const params = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const response = await fetch(`/api/admin/pages/${params.id}`);
        if (!response.ok) throw new Error('Erro ao carregar página');
        const data = await response.json();
        setPage(data);
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a página.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      loadPage();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Aguarde, carregando os produtos...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-500">Página não encontrada</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Página</CardTitle>
          <CardDescription>
            Edite os detalhes da página
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PageForm initialData={page} />
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
