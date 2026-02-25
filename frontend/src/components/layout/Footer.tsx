import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Maison de Parfum</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Curating the world&apos;s finest fragrances — niche, designer, and Arabic perfumery for the discerning collector.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/products" className="hover:text-white transition-colors">All Fragrances</Link></li>
            <li><Link href="/nosotros" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contacto" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">My Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/account/profile" className="hover:text-white transition-colors">My Profile</Link></li>
            <li><Link href="/account/orders" className="hover:text-white transition-colors">My Orders</Link></li>
            <li><Link href="/auth/login" className="hover:text-white transition-colors">Log In</Link></li>
            <li><Link href="/auth/register" className="hover:text-white transition-colors">Register</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contacto" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><a href="mailto:hello@maisonparfum.com" className="hover:text-white transition-colors">hello@maisonparfum.com</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Maison de Parfum. All rights reserved.
      </div>
    </footer>
  );
}
