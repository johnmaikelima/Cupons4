export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Cupons de Desconto. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
