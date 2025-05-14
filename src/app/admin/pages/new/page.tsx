'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageForm from '@/components/admin/PageForm';

export default function NewPagePage() {
  return (
    <div className="container mx-auto py-6">

      <Card>
        <CardHeader>
          <CardTitle>Nova Página</CardTitle>
          <CardDescription>
            Crie uma nova página para o seu site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PageForm />
        </CardContent>
      </Card>
    </div>
  );
}
