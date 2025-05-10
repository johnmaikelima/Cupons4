import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | LinkCompra',
  description: 'Termos de uso da LinkCompra. Leia as condições de uso da nossa plataforma.',
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
          <p className="text-xl text-blue-100">
            Condições de uso da plataforma LinkCompra
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-600">
                Ao acessar e usar o site LinkCompra (linkcompra.com), você concorda com estes 
                termos de uso. Se você não concordar com qualquer parte destes termos, não 
                deverá usar nosso site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Uso do Serviço</h2>
              <p className="text-gray-600 mb-4">
                Nosso serviço permite que você:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Acesse cupons de desconto</li>
                <li>Visualize ofertas de lojas parceiras</li>
                <li>Compartilhe cupons com outros usuários</li>
                <li>Receba notificações sobre novas ofertas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Responsabilidades</h2>
              <p className="text-gray-600 mb-4">
                A LinkCompra se compromete a:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Manter os cupons atualizados</li>
                <li>Verificar a validade das ofertas</li>
                <li>Fornecer suporte aos usuários</li>
                <li>Proteger os dados dos usuários</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Limitações</h2>
              <p className="text-gray-600">
                A LinkCompra não se responsabiliza por:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Problemas técnicos nas lojas parceiras</li>
                <li>Alterações de preços e disponibilidade de produtos</li>
                <li>Cancelamento de cupons pelas lojas</li>
                <li>Problemas na entrega ou qualidade dos produtos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Propriedade Intelectual</h2>
              <p className="text-gray-600">
                Todo o conteúdo do site LinkCompra, incluindo textos, imagens, logos e códigos, 
                são protegidos por direitos autorais e não podem ser reproduzidos sem autorização.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Alterações nos Termos</h2>
              <p className="text-gray-600">
                A LinkCompra se reserva o direito de modificar estes termos a qualquer momento. 
                As alterações entrarão em vigor assim que publicadas no site. O uso continuado 
                do serviço após as alterações implica na aceitação dos novos termos.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
