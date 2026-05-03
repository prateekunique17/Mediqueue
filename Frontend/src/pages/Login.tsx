import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter credentials");
      return;
    }
    setLoading(true);
    try {
      const profile = await signInWithEmail(email, password);
      if (profile.role === 'admin') navigate('/admin');
      else if (profile.role === 'hospital') navigate('/hospital');
      else navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 bg-surface-container-low antialiased">
      <div className="w-full max-w-[440px] animate-fade">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-on-primary mb-4 shadow-lg shadow-primary/20">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-primary tracking-tight">MEDIQUEUE</h1>
          <p className="font-body text-on-surface-variant mt-2 text-sm font-medium">Clinical Precision Guaranteed.</p>
        </div>

        <div className="bg-white rounded-3xl border border-outline-variant ambient-shadow-card p-8 md:p-10">
          <div className="mb-8">
            <h2 className="font-headline text-2xl font-bold text-on-surface">Sign In</h2>
            <p className="font-body text-sm text-on-surface-variant mt-1">Enter your credentials. System auto-detects role.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  className="w-full h-[52px] bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-4 py-2 font-body text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all font-semibold" 
                  id="email" 
                  type="email"
                  placeholder="dr.smith@citygeneral.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest" htmlFor="password">Password</label>
                <a className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline" href="#">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  className="w-full h-[52px] bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-4 py-2 font-body text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all font-semibold tracking-widest" 
                  id="password" 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                disabled={loading}
                className="w-full h-[56px] bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                type="submit"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>Authenticate Securely</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="font-body text-sm text-on-surface-variant font-medium">
                Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline ml-1">Sign Up</Link>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="font-body text-[10px] font-black text-outline uppercase tracking-[0.2em]">
            Need system access? <a className="text-primary hover:underline" href="#">Contact IT Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
