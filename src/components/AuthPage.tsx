import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, Lock, User, ArrowRight, Github, ChevronLeft } from 'lucide-react';
import { auth } from '../lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

interface AuthPageProps {
  onAuthSuccess: (user: { email: string }) => void;
  onBack: () => void;
}

export default function AuthPage({ onAuthSuccess, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) {
        onAuthSuccess({ email: result.user.email });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) {
        onAuthSuccess({ email: result.user.email });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (result.user.email) onAuthSuccess({ email: result.user.email });
      } else if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (name && result.user) {
          await updateProfile(result.user, { displayName: name });
        }
        if (result.user.email) onAuthSuccess({ email: result.user.email });
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Password reset email sent! Please check your inbox.');
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative z-10"
      >
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <button onClick={onBack} className="mb-8">
              <div className="w-16 h-16 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-xl shadow-indigo-100 mb-6">
                <Sparkles className="text-white" size={32} />
              </div>
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium text-center">
              {mode === 'login' 
                ? 'Sign in to access your meeting intelligence.' 
                : mode === 'signup' 
                ? 'Start your journey with professional AI tools.'
                : 'Enter your email to receive a recovery link.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-3 rounded-xl text-xs font-bold text-center"
                >
                  {success}
                </motion.div>
              )}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link')}
              <ArrowRight size={18} />
            </button>

            {mode === 'forgot' && (
              <button 
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1"
              >
                <ChevronLeft size={14} />
                Back to Sign In
              </button>
            )}
          </form>

          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Or continue with</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="flex gap-4 w-full">
              <button 
                onClick={handleGithubLogin}
                disabled={loading}
                className="flex-1 bg-white border border-slate-200 rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all font-bold text-xs text-slate-700 group disabled:opacity-50"
              >
                <div className="w-5 h-5 bg-slate-900 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Github size={12} className="text-white" />
                </div>
                Github
              </button>
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex-1 bg-white border border-slate-200 rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all font-bold text-xs text-slate-700 group disabled:opacity-50"
              >
                <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center group-hover:scale-110 transition-transform text-[10px] text-white font-black">G</div>
                Google
              </button>
            </div>

            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up it's free" 
                : mode === 'signup' 
                ? "Already have an account? Sign in here"
                : ""}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
