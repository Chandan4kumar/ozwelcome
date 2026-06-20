import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await resetPassword(email);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-sand-50 to-white flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-sand-200 p-8">
            <div className="w-16 h-16 bg-eucalyptus-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-eucalyptus-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-sand-900 mb-2">Check Your Email</h2>
            <p className="text-sand-600 mb-4">We've sent a password reset link to <strong className="text-sand-800">{email}</strong>.</p>
            <p className="text-sm text-sand-500 mb-6">The link will expire in 1 hour. Check your spam folder if you don't see it.</p>
            <Link to="/login" className="btn-primary">
              Back to Login
            </Link>
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
          <h1 className="font-display text-3xl font-bold text-sand-900 mb-2">Reset Your Password</h1>
          <p className="text-sand-600">Enter your email and we'll send you a link to reset your password.</p>
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
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : <><Mail className="w-4 h-4 mr-2" /> Send Reset Link</>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-sand-600 hover:text-ochre-600 transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
