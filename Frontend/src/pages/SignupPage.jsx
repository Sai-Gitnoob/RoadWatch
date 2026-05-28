import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2, Mail, Lock, User, Calendar } from 'lucide-react';
import { authService } from '../services/authService';
import useAppStore from '../store/useAppStore';
import logo from '../assets/logo.png';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAppStore();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dob || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authService.signup(formData.name, formData.dob, formData.email, formData.password);
      
      const { token, user } = data;
      if (!token) throw new Error("Invalid response from server");
      
      login(user || { name: formData.name, email: formData.email, dob: formData.dob }, token);
      navigate('/map');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-surface flex flex-col items-center justify-center p-6 w-full py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="RoadWatch Logo" className="h-16 w-auto object-contain mb-4 drop-shadow-sm" />
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">RoadWatch</h1>
          <p className="text-text-muted text-sm font-medium mt-1">Join the community. Report issues.</p>
        </div>

        <div className="bg-bg-base border border-border-subtle rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-text-main mb-6">Create Account</h2>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3">
              <ShieldAlert className="text-danger flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-danger font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative flex items-center bg-bg-surface rounded-xl border border-border-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
                <div className="pl-4 pr-2 text-slate-400"><User size={18} /></div>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  className="flex-1 bg-transparent py-3.5 pr-4 text-sm font-semibold text-text-main outline-none placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Date of Birth</label>
              <div className="relative flex items-center bg-bg-surface rounded-xl border border-border-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
                <div className="pl-4 pr-2 text-slate-400"><Calendar size={18} /></div>
                <input 
                  type="date" name="dob" value={formData.dob} onChange={handleChange}
                  className="flex-1 bg-transparent py-3.5 pr-4 text-sm font-semibold text-text-main outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative flex items-center bg-bg-surface rounded-xl border border-border-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
                <div className="pl-4 pr-2 text-slate-400"><Mail size={18} /></div>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="flex-1 bg-transparent py-3.5 pr-4 text-sm font-semibold text-text-main outline-none placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative flex items-center bg-bg-surface rounded-xl border border-border-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
                <div className="pl-4 pr-2 text-slate-400"><Lock size={18} /></div>
                <input 
                  type="password" name="password" value={formData.password} onChange={handleChange}
                  className="flex-1 bg-transparent py-3.5 pr-4 text-sm font-semibold text-text-main outline-none placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:shadow-md"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Account...</>
              ) : ('Sign Up')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Judge/Admin Access Notice */}
<div className="mt-5 bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 shadow-sm">
  <div className="flex items-start gap-3">
    <div className="text-yellow-600 text-xl">⚠️</div>

    <div>
      <h3 className="text-sm font-extrabold text-yellow-800 uppercase tracking-wide">
        Judge Access Information
      </h3>

      <p className="text-sm text-yellow-900 mt-1 leading-relaxed font-medium">
         Admin login credentials are available in the PPT and Word Doc for acess to Admin Dashboard. 
         Demo User credentials are also provided For quick access.
      </p>
    </div>
  </div>
</div>
    </div>
  );
}
