import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2, Mail, Lock } from 'lucide-react';
import { authService } from '../services/authService';
import useAppStore from '../store/useAppStore';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAppStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authService.login(email, password);
      // data should contain user and token based on standard backends
      const { token, user } = data;
      
      if (!token) throw new Error("Invalid response from server");
      
      login(user || { email, name: email.split('@')[0] }, token);
      navigate('/map');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-surface flex flex-col items-center justify-center p-6 w-full">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="RoadWatch Logo" className="h-16 w-auto object-contain mb-4 drop-shadow-sm" />
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">RoadWatch</h1>
          <p className="text-text-muted text-sm font-medium mt-1">Track roads. Track accountability.</p>
        </div>

        <div className="bg-bg-base border border-border-subtle rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-text-main mb-6">Welcome Back</h2>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3">
              <ShieldAlert className="text-danger flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-danger font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative flex items-center bg-bg-surface rounded-xl border border-border-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
                <div className="pl-4 pr-2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent py-3.5 pr-4 text-sm font-semibold text-text-main outline-none placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative flex items-center bg-bg-surface rounded-xl border border-border-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
                <div className="pl-4 pr-2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent py-3.5 pr-4 text-sm font-semibold text-text-main outline-none placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-text-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
