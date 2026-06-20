import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'text-ochre-600 border-b-2 border-ochre-500'
        : 'text-sand-700 hover:text-ochre-600'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-sand-200 shadow-sm">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-ochre-500 rounded-lg flex items-center justify-center shadow-md group-hover:bg-ochre-600 transition-colors">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-sand-900">
              OZ<span className="text-ochre-500">Welcome</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/services" className={linkClass('/services')}>Services</Link>
            {user ? (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
                <button
                  onClick={signOut}
                  className="text-sand-600 hover:text-ochre-600 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm px-4 py-2">Log In / Sign Up</Link>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-sand-700 hover:text-ochre-600"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-sand-200 shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className={`block py-2 ${linkClass('/')}`} onClick={() => setOpen(false)}>Home</Link>
            <Link to="/services" className={`block py-2 ${linkClass('/services')}`} onClick={() => setOpen(false)}>Services</Link>
            {user ? (
              <>
                <Link to="/dashboard" className={`block py-2 ${linkClass('/dashboard')}`} onClick={() => setOpen(false)}>Dashboard</Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="block py-2 text-sand-600 hover:text-ochre-600 font-medium">Sign Out</button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm w-full text-center" onClick={() => setOpen(false)}>Log In / Sign Up</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
