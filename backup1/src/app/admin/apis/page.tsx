'use client';

import { useState, useEffect } from 'react';
import { Network, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface ApiConfig {
  _id: string;
  name: string;
  provider: string;
  appToken: string;
  sourceId: string;
  baseUrl: string;
  lastSync?: Date;
}

const lomadeeFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  appToken: z.string().min(1, 'App Token é obrigatório'),
  sourceId: z.string().min(1, 'Source ID é obrigatório'),
  baseUrl: z.string()
    .min(1, 'URL Base é obrigatória')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL deve começar com http:// ou https://'
    )
    .refine(
      (url) => url.endsWith('/v2'),
      'URL deve terminar com /v2'
    ),
});

export default function ApisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [apis, setApis] = useState<ApiConfig[]>([]);
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null);

  const form = useForm({
    resolver: zodResolver(lomadeeFormSchema),
    defaultValues: {
      name: '',
      appToken: '',
      sourceId: '',
      baseUrl: 'http://sandbox-api.lomadee.com/v2',
    },
  });

  useEffect(() => {
    loadApis();
  }, []);

  useEffect(() => {
    if (editingApi) {
      form.reset({
        name: editingApi.name,
        appToken: editingApi.appToken,
        sourceId: editingApi.sourceId,
        baseUrl: editingApi.baseUrl || 'http://sandbox-api.lomadee.com/v2',
      });
    }
  }, [editingApi, form]);

  async function loadApis() {
    try {
      const response = await fetch('/api/admin/apis');
      if (!response.ok) throw new Error('Erro ao carregar APIs');
      const data = await response.json();
      setApis(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as APIs configuradas.',
        variant: 'destructive',
      });
    }
  }

  async function onSubmit(data: z.infer<typeof lomadeeFormSchema>) {
    try {
      setIsLoading(true);
      const method = editingApi ? 'PUT' : 'POST';
      const url = editingApi 
        ? `/api/admin/apis/${editingApi._id}` 
        : '/api/admin/apis';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          provider: 'lomadee',
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Erro ao salvar API');
      }

      toast({
        title: 'API configurada com sucesso!',
        description: 'A API da Lomadee foi configurada e está pronta para uso.',
      });

      form.reset();
      setEditingApi(null);
      loadApis();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao configurar a API.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSync(apiId: string) {
    try {
      setIsSyncing(apiId);
      const response = await fetch(`/api/admin/apis/${apiId}/sync`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao sincronizar API');
      }

      const { stats } = data;
      toast({
        title: 'Sincronização concluída',
        description: `Foram sincronizados ${stats.stores} lojas e ${stats.coupons} cupons.`,
      });

      loadApis();
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível iniciar a sincronização.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Configuração de APIs</h1>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-6 w-6" />
            <CardTitle>{editingApi ? 'Editar API Lomadee' : 'Configurar Lomadee'}</CardTitle>
          </div>
          <CardDescription>
            Configure a API da Lomadee para importar lojas e cupons automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Configuração</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lomadee Produção" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Base</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: http://sandbox-api.lomadee.com/v2" 
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      A URL deve começar com http:// ou https:// e terminar com /v2
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Token</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu App Token da Lomadee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu Source ID da Lomadee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : (editingApi ? 'Atualizar' : 'Salvar Configuração')}
                </Button>
                {editingApi && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setEditingApi(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {apis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>APIs Configuradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apis.map((api) => (
                <div 
                  key={api._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{api.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Última sincronização: {api.lastSync 
                        ? new Date(api.lastSync).toLocaleString('pt-BR')
                        : 'Nunca'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingApi(api)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSyncing === api._id}
                      onClick={() => handleSync(api._id)}
                    >
                      <RefreshCw className={`h-4 w-4 ${isSyncing === api._id ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Toaster />
    </div>
  );
}
