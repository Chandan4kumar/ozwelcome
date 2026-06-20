import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-sand-900 text-sand-200">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-ochre-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                OZ<span className="text-ochre-400">Welcome</span>
              </span>
            </Link>
            <p className="text-sand-400 text-sm leading-relaxed">
              Your trusted guide to starting life in Australia. 14 years of experience, real advice, real support.
            </p>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services/ask-an-aussie" className="text-sand-400 hover:text-ochre-400 transition-colors">Ask an Aussie</Link></li>
              <li><Link to="/services/get-hired" className="text-sand-400 hover:text-ochre-400 transition-colors">Get Hired</Link></li>
              <li><Link to="/services/mock-interview" className="text-sand-400 hover:text-ochre-400 transition-colors">Mock Interview</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-sand-400 hover:text-ochre-400 transition-colors">Why Australia</Link></li>
              <li><Link to="/" className="text-sand-400 hover:text-ochre-400 transition-colors">FAQ</Link></li>
              <li><Link to="/dashboard" className="text-sand-400 hover:text-ochre-400 transition-colors">My Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-sand-400">
                <Mail className="w-4 h-4 text-ochre-400" />
                hello@ozwelcome.com
              </li>
              <li className="flex items-center gap-2 text-sand-400">
                <Phone className="w-4 h-4 text-ochre-400" />
                +61 400 000 000
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-sand-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sand-500 text-sm">&copy; 2026 OzWelcome. All rights reserved.</p>
          <p className="text-sand-600 text-xs">Made with care for people starting their Australian journey.</p>
        </div>
      </div>
    </footer>
  );
}
