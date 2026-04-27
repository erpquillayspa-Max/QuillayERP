import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <nav className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo/quillay-logo.png" alt="Quillay" width={40} height={40} />
          <span className="font-serif text-xl text-quillay-tronco">QUILLAY</span>
        </div>
        <Link href="/login" className="bg-quillay-medio hover:bg-quillay-oscuro text-white px-5 py-2 rounded transition">
          Ingresar al ERP
        </Link>
      </nav>
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl text-center">
          <Image src="/logo/quillay-logo.png" alt="Quillay" width={200} height={200} className="mx-auto mb-8" priority />
          <p className="text-xl text-neutral-700 mb-4">Construccion y subcontratos</p>
          <p className="text-neutral-500 mb-12 max-w-2xl mx-auto">Sitio en construccion. Proximamente informacion sobre nuestros servicios, proyectos y equipo.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#servicios" className="bg-quillay-medio hover:bg-quillay-oscuro text-white px-8 py-3 rounded text-lg transition inline-block">
              Ver servicios
            </a>
            <a href="mailto:info.quillayspa@gmail.com" className="text-quillay-medio hover:text-quillay-oscuro px-6 py-3 transition">
              info.quillayspa@gmail.com
            </a>
          </div>
        </div>
      </section>
      <section id="servicios" className="bg-neutral-50 px-6 py-16 border-t border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-quillay-tronco text-center mb-2">Nuestros Servicios</h2>
          <p className="text-center text-neutral-500 mb-12">Construccion industrial y subcontratos especializados</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-quillay-medio/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="font-medium text-quillay-tronco mb-2">Estructuras Metalicas</h3>
              <p className="text-sm text-neutral-600">Diseño, fabricacion e instalacion de estructuras metalicas para proyectos industriales y comerciales.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-quillay-medio/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <h3 className="font-medium text-quillay-tronco mb-2">Subcontratos</h3>
              <p className="text-sm text-neutral-600">Servicios especializados de subcontratacion para grandes obras, con personal calificado y herramientas propias.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <div className="w-12 h-12 bg-quillay-medio/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="font-medium text-quillay-tronco mb-2">Protecciones y Sellos</h3>
              <p className="text-sm text-neutral-600">Instalacion de sistemas de proteccion, sellos perimetrales y soluciones de seguridad para edificaciones.</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <a href="mailto:info.quillayspa@gmail.com" className="text-quillay-medio hover:text-quillay-oscuro font-medium">
              Interesado en nuestros servicios? Contactanos
            </a>
          </div>
        </div>
      </section>
      <footer className="border-t border-neutral-200 px-6 py-6 text-center text-neutral-500 text-sm">
        <p>Quillay SPA - RUT 76.402.512-1 - Putre 6660, Huechuraba, Santiago</p>
        <p className="mt-1">2026 Quillay SPA. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
