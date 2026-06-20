import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The hash fragment contains the access token from email confirmation
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (!accessToken) {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try again.');
          return;
        }

        // Set the session using the tokens from the URL
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else {
          setStatus('success');
          if (type === 'signup') {
            setMessage('Your email has been confirmed! Your account is now active.');
          } else if (type === 'recovery') {
            setMessage('Password reset confirmed. You can now set your new password.');
          } else {
            setMessage('Email verified successfully!');
          }
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-sand-50 to-white flex items-center justify-center py-12">
      <div className="w-full max-w-md px-4 text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-sand-200 p-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-ochre-500 rounded-lg flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-sand-900">
              OZ<span className="text-ochre-500">Welcome</span>
            </span>
          </div>

          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-ochre-500 animate-spin mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-sand-900 mb-2">Verifying...</h2>
              <p className="text-sand-600">Please wait while we confirm your email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-eucalyptus-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-eucalyptus-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-sand-900 mb-2">Email Confirmed!</h2>
              <p className="text-sand-600 mb-6">{message}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
              >
                Go to Dashboard
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="font-display text-2xl font-bold text-sand-900 mb-2">Verification Failed</h2>
              <p className="text-sand-600 mb-6">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
