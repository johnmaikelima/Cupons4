'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Editor } from '@tinymce/tinymce-react';
import slugify from 'slugify';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

const pageFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  categoryText: z.string().optional(),
});

type PageFormValues = z.infer<typeof pageFormSchema>;

interface PageFormProps {
  initialData?: {
    _id?: string;
    title: string;
    slug: string;
    content: string;
    categoryText?: string;
  };
}

export default function PageForm({ initialData }: PageFormProps) {
  const router = useRouter();
  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      categoryText: initialData?.categoryText || '',
    },
  });

  const { watch, setValue } = form;

  // Atualiza o slug automaticamente quando o título muda
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'title') {
        setValue('slug', slugify(value.title || '', { lower: true, strict: true }));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  async function onSubmit(data: PageFormValues) {
    try {
      const url = initialData?._id 
        ? `/api/admin/pages/${initialData._id}`
        : '/api/admin/pages';
      
      const method = initialData?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar página');
      }

      toast({
        title: 'Sucesso',
        description: 'Página salva com sucesso.',
      });

      router.push('/admin/pages');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar página. Tente novamente.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da página" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input 
                  placeholder="url-da-pagina" 
                  {...field} 
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    field.onChange(slugify(value, { lower: true, strict: true }));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Editor
                  apiKey="s23aoeifcbl74nkfrufxejuxew0kf1wfbzlzp0b9m7pyh4cp"
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'blocks | ' +
                      'bold italic underline | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist | ' +
                      'link image table | removeformat | ofertas',
                    block_formats: 'Título 1=h1;Título 2=h2;Título 3=h3;Parágrafo=p;Citação=blockquote',
                    extended_valid_elements: 'div[id|class|style]',
                    setup: (editor) => {
                      editor.ui.registry.addButton('ofertas', {
                        text: 'Inserir Ofertas',
                        onAction: () => {
                          editor.insertContent('<div id="ofertas-dinamicas"></div>');
                        }
                      });
                    },
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                  value={field.value}
                  onEditorChange={(content) => field.onChange(content)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto sobre a Categoria</FormLabel>
              <FormControl>
                <Editor
                  apiKey="s23aoeifcbl74nkfrufxejuxew0kf1wfbzlzp0b9m7pyh4cp"
                  init={{
                    height: 300,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'blocks | ' +
                      'bold italic underline | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist | ' +
                      'link image table | removeformat',
                    block_formats: 'Título 1=h1;Título 2=h2;Título 3=h3;Parágrafo=p;Citação=blockquote',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                  value={field.value}
                  onEditorChange={(content) => field.onChange(content)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit">
            {initialData?._id ? 'Atualizar' : 'Criar'} Página
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/pages')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
