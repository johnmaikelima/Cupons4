import { notFound } from 'next/navigation';
import StoreForm from '@/components/admin/StoreForm';
import { Store } from '@/models/Store';
import { connectDB } from '@/lib/mongodb';

interface Props {
  params: {
    id: string;
  };
}

export default async function EditStorePage({ params }: Props) {
  await connectDB();
  const store = await Store.findById(params.id);

  if (!store) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Loja</h1>
      <StoreForm initialData={JSON.parse(JSON.stringify(store))} />
    </div>
  );
}
