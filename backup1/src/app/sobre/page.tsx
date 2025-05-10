import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nós | LinkCompra',
  description: 'Conheça a LinkCompra, seu destino para encontrar os melhores cupons de desconto.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Sobre Nós</h1>
          <p className="text-xl text-blue-100">
            Conheça a LinkCompra e nossa missão de ajudar você a economizar
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Nossa História</h2>
            <p className="text-gray-600 mb-6">
              A LinkCompra nasceu com uma missão clara: facilitar o acesso a descontos e ofertas 
              das melhores lojas online do Brasil. Desde o início, nosso compromisso tem sido 
              ajudar os consumidores a economizar em suas compras online.
            </p>
            <p className="text-gray-600">
              Trabalhamos diariamente para manter nossa plataforma atualizada com os melhores 
              cupons de desconto, garantindo que nossos usuários tenham acesso às melhores 
              ofertas disponíveis no mercado.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">Nossos Valores</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Transparência</h3>
                  <p className="text-gray-600">
                    Mantemos uma comunicação clara e honesta com nossos usuários sobre todas as ofertas e condições.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Qualidade</h3>
                  <p className="text-gray-600">
                    Verificamos todos os cupons diariamente para garantir seu funcionamento.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Compromisso</h3>
                  <p className="text-gray-600">
                    Estamos sempre buscando as melhores ofertas para nossos usuários.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
