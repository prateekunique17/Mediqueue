import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

const Signup: React.FC = () => {
  const [role, setRole] = useState<'patient' | 'hospital' | 'admin'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, fullName, role);
      if (role === 'hospital') navigate('/hospital');
      else if (role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card rounded-[2.5rem] p-10 shadow-2xl border border-border"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Join MediQueue</h1>
          <p className="text-text-secondary font-medium mt-2">Create your medical triage account</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`p-4 rounded-2xl border-2 transition text-center ${role === 'patient' ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-text-secondary/30 text-text-secondary'}`}
          >
            <div className="font-bold text-sm">Patient</div>
            <div className="text-[9px] uppercase font-black opacity-60 tracking-widest mt-1">Care</div>
          </button>
          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`p-4 rounded-2xl border-2 transition text-center ${role === 'hospital' ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-text-secondary/30 text-text-secondary'}`}
          >
            <div className="font-bold text-sm">Hospital</div>
            <div className="text-[9px] uppercase font-black opacity-60 tracking-widest mt-1">Provider</div>
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`p-4 rounded-2xl border-2 transition text-center ${role === 'admin' ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-text-secondary/30 text-text-secondary'}`}
          >
            <div className="font-bold text-sm">Admin</div>
            <div className="text-[9px] uppercase font-black opacity-60 tracking-widest mt-1">System</div>
          </button>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4 mb-6">
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-4 bg-bg border border-border rounded-xl text-text-primary focus:border-accent outline-none transition"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
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
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>


        <p className="mt-8 text-center text-sm text-text-secondary font-medium">
          Already have an account? <button onClick={() => navigate('/login')} className="text-accent font-bold hover:underline">Log in</button>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
