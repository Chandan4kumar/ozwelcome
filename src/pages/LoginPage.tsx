import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, LogIn, AlertCircle } from 'lucide-react';

/** Validate that a redirect URL is safe (only internal paths) */
function isSafeRedirect(url: string | null): boolean {
  if (!url) return false;
  try {
    // Only allow relative paths or same-origin absolute URLs
    if (url.startsWith('/')) return true;
    const parsed = new URL(url);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = sessionStorage.getItem('postAuthRedirect');
  if (user) return <Navigate to={isSafeRedirect(redirect) ? redirect! : '/dashboard'} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      const savedRedirect = sessionStorage.getItem('postAuthRedirect');
      if (savedRedirect) {
        sessionStorage.removeItem('postAuthRedirect');
      }
      if (isSafeRedirect(savedRedirect)) {
        navigate(savedRedirect!);
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-sand-50 to-white flex items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-ochre-500 rounded-lg flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-sand-900">
              OZ<span className="text-ochre-500">Welcome</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-sand-900 mb-2">Welcome Back</h1>
          <p className="text-sand-600">Log in to manage your bookings and services.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-sand-200 p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-sand-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-sand-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-ochre-600 font-medium hover:text-ochre-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="Your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : <><LogIn className="w-4 h-4 mr-2" /> Sign In</>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-sand-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-ochre-600 font-semibold hover:text-ochre-700 transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
