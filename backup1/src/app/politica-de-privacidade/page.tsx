import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | LinkCompra',
  description: 'Política de privacidade da LinkCompra. Saiba como protegemos seus dados.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
          <p className="text-xl text-blue-100">
            Saiba como protegemos seus dados
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-6">
              Última atualização: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
              <p className="text-gray-600">
                A LinkCompra está comprometida em proteger sua privacidade. Esta Política de 
                Privacidade explica como coletamos, usamos e protegemos suas informações pessoais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Coleta de Informações</h2>
              <p className="text-gray-600 mb-4">
                Coletamos informações quando você:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Visita nosso website</li>
                <li>Utiliza nossos cupons</li>
                <li>Se inscreve em nossa newsletter</li>
                <li>Entra em contato conosco</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Uso das Informações</h2>
              <p className="text-gray-600 mb-4">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Melhorar nossos serviços</li>
                <li>Enviar newsletters (quando solicitado)</li>
                <li>Responder suas dúvidas</li>
                <li>Personalizar sua experiência</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Proteção de Dados</h2>
              <p className="text-gray-600">
                Implementamos medidas de segurança para proteger suas informações contra acesso, 
                alteração, divulgação ou destruição não autorizada. Seus dados são mantidos em 
                servidores seguros e apenas funcionários autorizados têm acesso a eles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
              <p className="text-gray-600">
                Utilizamos cookies para melhorar sua experiência em nosso site. Você pode 
                configurar seu navegador para recusar cookies, mas isso pode afetar algumas 
                funcionalidades do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contato</h2>
              <p className="text-gray-600">
                Se você tiver dúvidas sobre nossa Política de Privacidade, entre em contato 
                através do e-mail: privacidade@linkcompra.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
