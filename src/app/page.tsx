import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo/quillay-logo.png" alt="Quillay" width={40} height={40} />
          <span className="font-serif text-xl text-quillay-tronco">QUILLAY</span>
        </div>
        <Link
          href="/login"
          className="bg-quillay-medio hover:bg-quillay-oscuro text-white px-5 py-2 rounded transition"
        >
          Ingresar al ERP
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl text-center">
          <Image
            src="/logo/quillay-logo.png"
            alt="Quillay"
            width={200}
            height={200}
            className="mx-auto mb-8"
            priority
          />
          <h1 className="font-serif text-6xl md:text-7xl text-quillay-tronco mb-6">
            QUILLAY
          </h1>
          <p className="text-xl text-neutral-700 mb-4">
            Construcción y subcontratos
          </p>
          <p className="text-neutral-500 mb-12 max-w-2xl mx-auto">
            Sitio en construcción. Próximamente información sobre nuestros
            servicios, proyectos y equipo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="bg-quillay-medio hover:bg-quillay-oscuro text-white px-8 py-3 rounded text-lg transition inline-block"
            >
              Acceder al sistema
            </Link>
            <a
              href="mailto:contacto@quillayspa.cl"
              className="text-quillay-medio hover:text-quillay-oscuro px-6 py-3 transition"
            >
              contacto@quillayspa.cl
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 px-6 py-6 text-center text-neutral-500 text-sm">
        <p>Quillay SPA · RUT 76.402.512-1 · Putre 6660, Huechuraba, Santiago</p>
        <p className="mt-1">© {new Date().getFullYear()} Quillay SPA. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
