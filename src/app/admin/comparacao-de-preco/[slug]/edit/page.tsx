'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { IComparisonProduct } from '@/models/ComparisonProduct';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Price {
  storeName: string;
  price: number;
  url: string;
  lastUpdate: Date;
}

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<IComparisonProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ean, setEan] = useState('');
  const [category, setCategory] = useState('');
  const [prices, setPrices] = useState<Price[]>([]);
  const [technicalSpecs, setTechnicalSpecs] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/comparison-products/${slug}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar produto');
        }

        const data = await response.json();
        setProduct(data.product);

        // Preencher os estados do formulário
        setName(data.product.name || '');
        setDescription(data.product.description || '');
        setEan(data.product.ean || '');
        setCategory(data.product.category || '');
        setPrices(data.product.prices || []);
        setTechnicalSpecs(new Map(Object.entries(data.product.technicalSpecs || {})));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Erro ao carregar produto:', error);
        setError('Erro ao carregar produto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = {
        name,
        description,
        ean,
        category,
        prices,
        technicalSpecs: Object.fromEntries(technicalSpecs),
      };
      console.log('Enviando dados:', data);

      const response = await fetch(`/api/admin/comparison-products/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.log('Erro da API:', error);
        throw new Error(error.error || 'Erro ao salvar produto');
      }

      toast.success('Produto atualizado com sucesso');
      router.push('/admin/comparacao-de-preco');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPrice = () => {
    setPrices([
      ...prices,
      {
        storeName: '',
        price: 0,
        url: '',
        lastUpdate: new Date(),
      },
    ]);
  };

  const handleRemovePrice = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  const handlePriceChange = (index: number, field: keyof Price, value: string | number) => {
    const newPrices = [...prices];
    newPrices[index] = {
      ...newPrices[index],
      [field]: field === 'price' ? Number(value) : value,
    };
    setPrices(newPrices);
  };

  const handleAddSpec = () => {
    const newSpecs = new Map(technicalSpecs);
    newSpecs.set('', '');
    setTechnicalSpecs(newSpecs);
  };

  const handleRemoveSpec = (key: string) => {
    const newSpecs = new Map(technicalSpecs);
    newSpecs.delete(key);
    setTechnicalSpecs(newSpecs);
  };

  const handleSpecChange = (oldKey: string, newKey: string, value: string) => {
    const newSpecs = new Map(technicalSpecs);
    if (oldKey !== newKey) {
      newSpecs.delete(oldKey);
    }
    newSpecs.set(newKey, value);
    setTechnicalSpecs(newSpecs);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Carregando produto...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Editar Produto</CardTitle>
            <CardDescription>Atualize as informações do produto</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ean">EAN</Label>
                    <Input
                      id="ean"
                      value={ean}
                      onChange={(e) => setEan(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Preços */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Preços</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPrice}
                  >
                    Adicionar Preço
                  </Button>
                </div>

                <div className="space-y-4">
                  {prices.map((price, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-lg"
                    >
                      <div>
                        <Label>Loja</Label>
                        <Input
                          value={price.storeName}
                          onChange={(e) => handlePriceChange(index, 'storeName', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label>Preço</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={price.price}
                          onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label>URL</Label>
                        <div className="flex gap-2">
                          <Input
                            value={price.url}
                            onChange={(e) => handlePriceChange(index, 'url', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemovePrice(index)}
                          >
                            X
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Especificações Técnicas */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Especificações Técnicas</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSpec}
                  >
                    Adicionar Especificação
                  </Button>
                </div>

                <div className="space-y-4">
                  {Array.from(technicalSpecs.entries()).map(([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-gray-50 p-4 rounded-lg"
                    >
                      <div>
                        <Label>Característica</Label>
                        <Input
                          value={key}
                          onChange={(e) => handleSpecChange(key, e.target.value, value)}
                          required
                        />
                      </div>

                      <div>
                        <Label>Valor</Label>
                        <div className="flex gap-2">
                          <Input
                            value={value}
                            onChange={(e) => handleSpecChange(key, key, e.target.value)}
                            required
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveSpec(key)}
                          >
                            X
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
