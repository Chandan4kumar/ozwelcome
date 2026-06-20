import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, UserPlus, AlertCircle, CheckCircle2, Mail } from 'lucide-react';

export default function SignupPage() {
  const { user, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await signUp(email, password, name);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setNeedsConfirmation(result.needsConfirmation);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-sand-50 to-white flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-sand-200 p-8">
            <div className="w-16 h-16 bg-eucalyptus-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {needsConfirmation ? (
                <Mail className="w-8 h-8 text-eucalyptus-600" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-eucalyptus-600" />
              )}
            </div>
            {needsConfirmation ? (
              <>
                <h2 className="font-display text-2xl font-bold text-sand-900 mb-2">Check Your Email</h2>
                <p className="text-sand-600 mb-4">We've sent a confirmation link to <strong className="text-sand-800">{email}</strong>.</p>
                <p className="text-sm text-sand-500 mb-6">Click the link in the email to verify your account. Check your spam folder if you don't see it.</p>
                <Link to="/login" className="btn-primary">
                  Continue to Login
                </Link>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-sand-900 mb-2">Account Created!</h2>
                <p className="text-sand-600 mb-6">You're all set. Start exploring our services and book your first session.</p>
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="font-display text-3xl font-bold text-sand-900 mb-2">Create Your Account</h1>
          <p className="text-sand-600">Join OzWelcome and start your Australian journey.</p>
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
              <label className="block text-sm font-semibold text-sand-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                placeholder="Your full name"
                required
              />
            </div>
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
              <label className="block text-sm font-semibold text-sand-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-sand-600">
            Already have an account?{' '}
            <Link to="/login" className="text-ochre-600 font-semibold hover:text-ochre-700 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
