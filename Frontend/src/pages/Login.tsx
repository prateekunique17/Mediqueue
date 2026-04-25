import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = (profile: any) => {
    if (profile.role === 'hospital') navigate('/hospital');
    else if (profile.role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const profile = await signInWithEmail(email, password);
      if (profile) handleAuthSuccess(profile);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-bg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card rounded-[2.5rem] p-10 shadow-2xl border border-border"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Welcome Back</h1>
          <p className="text-text-secondary font-medium mt-2">Access your triage dashboard</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 bg-bg border border-border rounded-xl text-text-primary focus:border-accent outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-bg border border-border rounded-xl text-text-primary focus:border-accent outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-white rounded-xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>


        <p className="mt-8 text-center text-sm text-text-secondary font-medium">
          Don't have an account? <button onClick={() => navigate('/signup')} className="text-accent font-bold hover:underline">Sign up</button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
