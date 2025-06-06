import { SiteConfig } from '@/models/SiteConfig';
import { connectDB } from '@/lib/mongoose';
import SiteConfigForm from '@/components/admin/SiteConfigForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  let config;

  try {
    await connectDB();
    config = await SiteConfig.findOne();
  } catch (error) {
    console.error('Error connecting to database:', error);
    // Durante o build, use configuração padrão
    config = {
      logo: '/logo.png',
      name: 'Linkcompra'
    };
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Configurações do Site</h1>
        <SiteConfigForm config={JSON.parse(JSON.stringify(config))} />
      </div>
    </div>
  );
}
