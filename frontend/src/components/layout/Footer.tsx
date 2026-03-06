import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-14">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Logo href="/" className="mb-4 opacity-90 hover:opacity-100" />
          <p className="text-sm text-gray-500 leading-relaxed mt-3">
            Tu destino para fragancias nicho, de diseñador y árabes — seleccionadas para el coleccionista exigente.
          </p>
        </div>
        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/products" className="hover:text-white transition-colors">All Fragrances</Link></li>
            <li><Link href="/nosotros" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contacto" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">My Account</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/account/profile" className="hover:text-white transition-colors">My Profile</Link></li>
            <li><Link href="/account/orders" className="hover:text-white transition-colors">My Orders</Link></li>
            <li><Link href="/auth/login" className="hover:text-white transition-colors">Log In</Link></li>
            <li><Link href="/auth/register" className="hover:text-white transition-colors">Register</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Support</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/contacto" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><a href="mailto:contacto@tienda.com" className="hover:text-white transition-colors">contacto@tienda.com</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
        <span>© {new Date().getFullYear()} Tienda en Línea. All rights reserved.</span>
        <span>Built with Next.js · Tailwind · Stripe</span>
      </div>
    </footer>
  );
}
