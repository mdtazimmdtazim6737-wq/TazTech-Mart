import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Shield, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, setActivePage } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const loggedUser = await login(email, password);
        if (loggedUser.role === 'super_admin' || loggedUser.role === 'admin' || loggedUser.role === 'manager') {
          // If admin, give prompt or stay
        }
      } else {
        await register({ name, email, phone, password });
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string, presetPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const u = await login(presetEmail, presetPass);
      setIsAuthModalOpen(false);
      if (['super_admin', 'admin', 'manager', 'content_manager', 'order_manager'].includes(u.role)) {
        setActivePage('admin');
      }
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsAuthModalOpen(false)}
        />

        {/* Modal Card */}
        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl relative z-10 border border-slate-100">
          
          <button 
            id="close-auth-modal-btn"
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-cyan-100 text-cyan-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {mode === 'login' ? 'Welcome Back to TazTech Mart' : 'Create Customer Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login' 
                ? 'Sign in to track orders, save wishlist gadgets, and checkout faster.' 
                : 'Join TazTech Mart for exclusive Bangladesh gadget discounts.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bangladesh Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <span>{loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-4 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => { setMode('register'); setError(null); }}
                  className="font-bold text-cyan-600 hover:underline"
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-bold text-cyan-600 hover:underline"
                >
                  Sign in here
                </button>
              </>
            )}
          </div>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                Demo Credentials (1-Click Test)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@taztechmart.com', 'admin123')}
                className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-left transition-colors"
              >
                <div className="font-bold flex items-center text-cyan-400">
                  <span>Super Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">admin@taztechmart.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rahim@gmail.com', 'customer123')}
                className="p-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 text-left transition-colors border border-slate-200"
              >
                <div className="font-bold text-slate-900">Customer</div>
                <div className="text-[10px] text-slate-500 truncate">rahim@gmail.com</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
