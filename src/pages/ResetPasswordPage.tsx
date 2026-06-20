import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check if we have a valid session from the password reset link
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsValidSession(true);
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-sand-50 to-white flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-ochre-500 animate-spin mx-auto mb-4" />
          <p className="text-sand-600">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-sand-50 to-white flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-sand-200 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-sand-900 mb-2">Invalid or Expired Link</h2>
            <p className="text-sand-600 mb-6">This password reset link is invalid or has expired. Please request a new one.</p>
            <Link to="/forgot-password" className="btn-primary">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-sand-50 to-white flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-sand-200 p-8">
            <div className="w-16 h-16 bg-eucalyptus-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-eucalyptus-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-sand-900 mb-2">Password Updated!</h2>
            <p className="text-sand-600 mb-6">Your password has been successfully reset. You can now sign in with your new password.</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Go to Login
            </button>
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
          <h1 className="font-display text-3xl font-bold text-sand-900 mb-2">Create New Password</h1>
          <p className="text-sand-600">Enter your new password below.</p>
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
              <label className="block text-sm font-semibold text-sand-700 mb-1.5">New Password</label>
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
            <div>
              <label className="block text-sm font-semibold text-sand-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : <><Lock className="w-4 h-4 mr-2" /> Reset Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
