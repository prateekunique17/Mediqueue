import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import { Menu, X, LogOut, LayoutDashboard, Stethoscope, ShieldCheck, HeartPulse, Activity, Bell, Settings } from 'lucide-react';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/PatientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentRequest from './pages/AppointmentRequest';

const App: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-on-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Overview', path: profile?.role === 'admin' ? '/admin' : profile?.role === 'hospital' ? '/hospital' : '/dashboard', icon: LayoutDashboard },
    ...(profile?.role === 'patient' ? [{ label: 'New Triage', path: '/request', icon: Stethoscope }] : []),
  ];

  const homePath = user 
    ? (profile?.role === 'admin' ? '/admin' : profile?.role === 'hospital' ? '/hospital' : '/dashboard')
    : '/';

  return (
    <div className="min-h-screen bg-background text-on-background font-body transition-colors">
      <nav className="bg-white/80 backdrop-blur-md border-b border-outline-variant px-6 h-16 sticky top-0 z-[100] flex items-center justify-center">
        <div className="max-w-7xl w-full flex justify-between items-center">
          <Link to={homePath} className="flex items-center gap-2 group text-[#0f4ed5]">
            <Activity className="w-6 h-6" />
            <span className="font-headline font-bold text-lg tracking-tight uppercase">Mediqueue</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 items-center justify-between ml-12">
            {user ? (
              <>
                <nav className="flex items-center gap-6 h-16 text-sm font-semibold text-slate-500">
                  <Link to="/dashboard" className="h-full flex items-center px-1 border-b-2 border-[#0f4ed5] text-[#0f4ed5]">Dashboard</Link>
                </nav>

                <div className="flex items-center gap-4">
                  <button onClick={signOut} className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2">
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-6 ml-auto h-16">
                <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Login</Link>
                <Link to="/signup" className="bg-[#0f4ed5] text-white py-2 px-5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-16 bg-white/95 backdrop-blur-lg z-[90] md:hidden animate-fade p-8 flex flex-col gap-6">
            {user ? (
              <>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant">
                   <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-on-primary font-black text-lg">
                      {user.email?.[0].toUpperCase()}
                   </div>
                   <div>
                      <p className="font-bold text-on-surface">{user.email}</p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest">{profile?.role}</p>
                   </div>
                </div>
                {navLinks.map(link => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 text-xl font-bold text-on-surface-variant hover:text-primary transition-colors py-2"
                  >
                    <link.icon className="w-6 h-6" />
                    {link.label}
                  </Link>
                ))}
                <button 
                  onClick={() => { signOut(); setIsMenuOpen(false); }}
                  className="flex items-center gap-4 text-xl font-bold text-error transition-colors py-2 mt-auto"
                >
                  <LogOut className="w-6 h-6" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-center border-2 border-outline-variant rounded-2xl font-bold">Login</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-center bg-primary text-on-primary rounded-2xl font-bold shadow-lg">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="w-full min-h-[calc(100vh-64px)] overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={
            user && profile?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />
          } />
          
          <Route path="/request" element={
            user && profile?.role === 'patient' ? <AppointmentRequest /> : <Navigate to="/login" />
          } />

          <Route path="/hospital" element={
            user && profile?.role === 'hospital' ? <HospitalDashboard /> : <Navigate to="/login" />
          } />

          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Toaster position="top-right" expand={true} richColors closeButton />
    </div>
  );
};

export default App;
