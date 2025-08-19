import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' ? { email, password } : { name, email, password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Authentication failed');
      }
      onAuthSuccess({ token: data.token, user: data.user });
      reset();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{mode === 'login' ? 'Log in' : 'Create account'}</h2>
          <button onClick={() => { reset(); onClose(); }} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full" placeholder="e.g., Komal Kalshetti" required />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field w-full" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field w-full" placeholder="••••••••" required />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" disabled={loading} className="w-full btn-primary">
            {loading ? 'Please wait…' : (mode === 'login' ? 'Log in' : 'Create account')}
          </button>
          <div className="text-sm text-center text-gray-600">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" className="text-primary-600 hover:underline" onClick={() => setMode('register')}>Create one</button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" className="text-primary-600 hover:underline" onClick={() => setMode('login')}>Log in</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;


