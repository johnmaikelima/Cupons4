import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Cupons
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Início
            </Link>
            <Link 
              href="/lojas" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Lojas
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
