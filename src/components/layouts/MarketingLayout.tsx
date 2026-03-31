import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, LayoutDashboard } from 'lucide-react';

interface MarketingLayoutProps {
  onAdminAccess: () => void;
}

export default function MarketingLayout({ onAdminAccess }: MarketingLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    // { path: '/pricing', label: 'Pricing' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-light shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-blue rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold">UniScheduling</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors ${
                    isActive(link.path)
                      ? 'text-primary-blue font-medium'
                      : 'text-body hover:text-primary-blue'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA + Demo Admin Access */}
            <div className="hidden md:flex items-center gap-3">
              {/* <Link
                to="/contact"
                className="px-5 py-2 text-primary-blue border border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition-all"
              >
                Request Access
              </Link> */}
              <Link
                to="/auth"
                className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity shadow-card"
              >
                Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-dark" />
              ) : (
                <Menu className="w-6 h-6 text-dark" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-light bg-white">
            <nav className="flex flex-col px-4 py-4 gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary-blue text-white'
                      : 'text-body hover:bg-soft'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-primary-blue border border-primary-blue rounded-lg text-center hover:bg-primary-blue hover:text-white transition-colors"
              >
                Request Access
              </Link>
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Login
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-blue rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold">UniScheduling</span>
              </div>
              <p className="text-gray-300 text-sm">
                University Class Scheduling System for modern institutions.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/features" className="hover:text-primary-blue">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary-blue">Pricing</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary-blue">How It Works</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/about" className="hover:text-primary-blue">About</Link></li>
                <li><Link to="/contact" className="hover:text-primary-blue">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-primary-blue">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-blue">Terms of Service</a></li>
                <li>
                  {/* <button
                    onClick={onAdminAccess}
                    className="hover:text-primary-blue flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 text-gray-300 text-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Panel
                  </button> */}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2025 UniScheduling. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}